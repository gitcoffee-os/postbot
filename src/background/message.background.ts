import { createMessageHandler } from '@gitcoffee-os/postbot-background';
import { POSTBOT_ACTION } from '@gitcoffee-os/postbot-actions';
import { state } from "~contents/components/postbot.data";
import { getPlatforms, platformMetas } from "~media/platform";
import { getMetaInfoList } from "~media/meta";
import { windowPublish } from "~media/publisher";
import { beginAutopublishRun, failAutopublishRun, isAutopublishRunActiveFor } from "~media/publisher/autopublish-collector";
import { user } from '@gitcoffee-os/postbot-api';

// 过滤已禁用的平台
const filterDisabledMetaInfoList = (metaInfoList: any) => {
    if (!metaInfoList || typeof metaInfoList !== 'object') return metaInfoList;
    return Object.fromEntries(
        Object.entries(metaInfoList).filter(([key]) => platformMetas[key]?.status !== 'disabled')
    );
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const getImageNameFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        if (filename && filename.includes('.')) {
            return filename;
        }
    } catch {}
    return `${Date.now()}.jpg`;
};

export const handleMessage = createMessageHandler({
  getPlatforms: (type?: string) => getPlatforms()[type || 'article'],
  getMetaInfoList: async () => {
    const metaInfoList = await getMetaInfoList();
    const filteredMetaInfoList = filterDisabledMetaInfoList(metaInfoList);
    state.metaInfoList = filteredMetaInfoList;
    return filteredMetaInfoList;
  },
  setContentData: (data: any) => { state.contentData = data; },
  getContentData: () => state.contentData,
  windowPublish: async (data: any, sender?: chrome.runtime.MessageSender) => {
    const mediaType = data.mediaType || 'article';
    const platformCodes = data.platformCodes;
    const publishPlatforms = getPlatforms();
    let allPlatforms = Object.values(publishPlatforms[mediaType]);
    const checkedPlatforms = allPlatforms.filter((item: any) => platformCodes.includes(item.code));

    // MV3 SW 可能在页面加载后被回收导致 state.metaInfoList 丢失（自动发布场景页面加载与
    // PUBLISH_NOW 之间可能有 publishDelayMs 间隔）→ 空则惰性补拉，避免 metaInfo 缺失
    if (!state.metaInfoList || Object.keys(state.metaInfoList).length === 0) {
      try {
        const metaInfoList = await getMetaInfoList();
        state.metaInfoList = filterDisabledMetaInfoList(metaInfoList);
      } catch (err) {
        console.warn('[autopublish] metaInfoList 补拉失败:', err);
      }
    }
    checkedPlatforms.forEach((item: any) => {
      item['metaInfo'] = state.metaInfoList?.[item.code];
    });

    // 自动发布（路径 D/M3）：请求携带 jobId 时开启终态收集，
    // sourceTabId（发布页标签）用于把 AUTOPUBLISH_RESULT 回传发布页 → 桌面 → engine
    if (data?.jobId !== undefined && data?.jobId !== null) {
      // 同 jobId 去重：进行中的收集轮期间，忽略陈旧发布页迟到的重复 PUBLISH_NOW
      // （否则 beginAutopublishRun 冲掉当前轮 + 平台 tab 被再次注入，发布器多实例竞态）
      if (isAutopublishRunActiveFor(data.jobId)) {
        console.warn('[autopublish] 同 jobId 发布轮进行中，忽略重复 PUBLISH_NOW:', data.jobId);
        return;
      }
      beginAutopublishRun(data.jobId, sender?.tab?.id, checkedPlatforms.map((item: any) => item.code));
      if (checkedPlatforms.length === 0) {
        // 快速失败：无有效平台（编码不匹配/全被禁用），立即交付终态
        failAutopublishRun('NO_PLATFORM', `无有效发布平台: ${(platformCodes || []).join(',')}`);
        return;
      }
    }

    const publishData = {
      platforms: checkedPlatforms,
      data: data,
    };
    try {
      // 必须 await：createTabsForPlatforms 是异步链，rejection 不 await 就会逃逸出本 try/catch
      // （实证：Electron 无 chrome.tabs.create 时 uncaught，collector 永不交付 → VERIFY 干等）
      await windowPublish(publishData);
    } catch (err) {
      console.error('[autopublish] windowPublish 执行失败:', err);
      if (data?.jobId !== undefined && data?.jobId !== null) {
        // 已开启收集 → 全平台 FAILED 立即交付终态，防止 engine 侧干等 PUBLISH_TIMEOUT
        failAutopublishRun('PUBLISH_FAILED', err instanceof Error ? err.message : String(err));
      }
    }
  },
  isLogin: () => user.isLoginApi({}),
  fetchImage: async (imageUrl: string) => {
    console.log('fetchImage', imageUrl);
    const response = await fetch(imageUrl);
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const base64data = `data:${contentType};base64,${base64}`;
    const imageName = getImageNameFromUrl(imageUrl);
    console.log('fetchImage success', imageName);
    return { base64data, imageName };
  },
});

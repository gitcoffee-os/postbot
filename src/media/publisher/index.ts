import { publish, getSupportedPlatforms } from '@gitcoffee-os/postbot-media';
import { getMetaInfoList } from "~media/meta";
import { createTabsForPlatformsWithScript } from "~tabs";
import { preparePublishData } from '@gitcoffee-os/postbot-content-transform';

export { publish, getSupportedPlatforms };

export const getPlatformMetaInfoList = () => {
  return getMetaInfoList();
};

export const windowPublish = async (data: any) => {
    if (!data?.platforms) {
        return;
    }
    if (data?.platforms.length === 0) {
        return;
    }

    // PostBot 内容适配层：在发布前识别 Markdown/HTML/文本，按平台画像渲染，
    // 结果附加到 platform.prepared，原始 data.data 保持不变。
    const prepared = await preparePublishData(data, {
      enabled: true,
    }).catch((err) => {
      console.warn('[content-transform] 适配失败，降级为原始内容', err);
      return data;
    });

    // 必须返回 Promise：调用方 await 后才能捕获异步 rejection（如 Electron 缺 chrome.tabs.create），
    // 否则异常逃逸 → collector 永不交付 AUTOPUBLISH_RESULT → engine 干等到超时
    return createTabsForPlatformsWithScript(prepared);
}

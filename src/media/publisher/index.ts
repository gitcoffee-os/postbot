import { publish, getSupportedPlatforms } from '@gitcoffee-os/postbot-media';
import { getMetaInfoList } from "~media/meta";
import { createTabsForPlatformsWithScript } from "~tabs";

export { publish, getSupportedPlatforms };

export const getPlatformMetaInfoList = () => {
  return getMetaInfoList();
};

export const windowPublish = (data: any) => {
    if (!data?.platforms) {
        return;
    }
    if (data?.platforms.length === 0) {
        return;
    }
    // 必须返回 Promise：调用方 await 后才能捕获异步 rejection（如 Electron 缺 chrome.tabs.create），
    // 否则异常逃逸 → collector 永不交付 AUTOPUBLISH_RESULT → engine 干等到超时
    return createTabsForPlatformsWithScript(data);
}

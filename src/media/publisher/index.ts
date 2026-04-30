import { publish, getSupportedPlatforms } from '@gitcoffee/postbot-media';
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
    createTabsForPlatformsWithScript(data);
}

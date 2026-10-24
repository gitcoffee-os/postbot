import { createMessageHandler } from '@gitcoffee-os/postbot-content-services';
import { getReaderData } from "~media/parser";
import { state } from "../components/postbot.data";
import { getPostBotBaseUrl } from '~config/config';
import { POSTBOT_ACTION } from '~message/postbot.action';
import { getMetaInfoList as rawGetMetaInfoList } from "~media/meta";
import { getWeixinMetaInfo } from "~media/meta/weixin.meta";
import { platformMetas } from '~media/platform';

const filterDisabledMetaInfoList = (metaInfoList: any) => {
    if (!metaInfoList || typeof metaInfoList !== 'object') return metaInfoList;
    return Object.fromEntries(
        Object.entries(metaInfoList).filter(([key]) => platformMetas[key]?.status !== 'disabled')
    );
};

const getMetaInfoList = async () => {
    const metaInfoList = await rawGetMetaInfoList();
    return filterDisabledMetaInfoList(metaInfoList);
};

export const handleMessage = createMessageHandler({
  state,
  getReaderData,
  getBaseUrl: getPostBotBaseUrl,
  publishPath: '/exmay/postbot/media/publish',
  actionSyncData: POSTBOT_ACTION.PUBLISH_SYNC_DATA,
  getMetaInfoList,
  getWeixinMetaInfo,
});

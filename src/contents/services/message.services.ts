import { createMessageHandler } from '@gitcoffee/postbot-content-services';
import { getReaderData } from "~media/parser";
import { state } from "../components/postbot.data";
import { getPostBotBaseUrl } from '~config/config';
import { POSTBOT_ACTION } from '~message/postbot.action';
import { getMetaInfoList } from "~media/meta";
import { getWeixinMetaInfo } from "~media/meta/weixin.meta";

export const handleMessage = createMessageHandler({
  state,
  getReaderData,
  getBaseUrl: getPostBotBaseUrl,
  publishPath: '/exmay/postbot/media/publish',
  actionSyncData: POSTBOT_ACTION.PUBLISH_SYNC_DATA,
  getMetaInfoList,
  getWeixinMetaInfo,
});

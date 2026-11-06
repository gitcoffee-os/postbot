import type { PlasmoCSConfig } from 'plasmo';
import { initMessageEventListener } from '@gitcoffee-os/postbot-content-services';
import { bridgeProfile } from '~message/bridge.profile';

// 兄弟 App 站点不注入：既不会挂载浮窗，也不会监听/响应页面消息。
// 运行时还有 channel + origin 双闸，这里是静态的第一层隔离。
export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  exclude_matches: ['*://postar.exmay.com/*', '*://postar-dev.exmay.com/*'],
};

initMessageEventListener(bridgeProfile);

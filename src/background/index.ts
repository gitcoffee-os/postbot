import { initPostBot } from "~api"
import "~plugins";
import { handleMessage } from "./message.background";
import { createBackgroundListener } from '@gitcoffee/postbot-background';
import { initContextMenusEvent } from "~events";
import { initAdapterBackground } from "./adapter.background";

export const config: PlasmoCSConfig = {}

console.log("Live now; make now always the most precious time. Now will never come again.")

initPostBot();
initContextMenusEvent();

console.log('PostBot chrome.runtime.onMessage.addListener');
createBackgroundListener(handleMessage);

initAdapterBackground().catch((error) => {
  console.error('[AiAdapter] 后台自适应模块初始化失败:', error);
});

if (process.env.NODE_ENV === 'development') {
  // 供内容脚本读取页面主世界的发布器调试配置注册表
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type !== 'GET_RUNTIME_DEBUG_CONFIGS') {
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) {
        sendResponse({});
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => {
            const key = '__postbotPublisherDebugRegistry__';
            const w = window as unknown as Record<string, any>;
            const registry = w[key];
            return registry ? JSON.parse(JSON.stringify(registry)) : {};
          },
          world: 'MAIN',
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.warn('[PostBot Background] fetch runtime debug configs failed:', chrome.runtime.lastError.message);
            sendResponse({});
            return;
          }
          sendResponse((results?.[0]?.result as Record<string, any>) || {});
        }
      );
    });
    return true;
  });
}

export { }

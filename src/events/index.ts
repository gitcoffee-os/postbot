import { initEvents } from '@gitcoffee-os/postbot-events';
import { CONTEXT_MENU_ACTION } from '@gitcoffee-os/postbot-actions';
import { user } from '@gitcoffee-os/postbot-api';

const checkLoginAndSend = async (tab: chrome.tabs.Tab | undefined, action: string, extra?: { srcUrl?: string }) => {
  if (!tab?.id) return;
  const send = (message: any) => {
    chrome.tabs.sendMessage(tab.id!, message, () => {
      // 忽略目标页不存在 / 上下文失效等错误
      void chrome.runtime.lastError;
    });
  };
  try {
    const res = await user.isLoginApi({});
    if (res?.data?.login) {
      send({ action, ...extra });
    } else {
      send({ action: CONTEXT_MENU_ACTION.DO_LOGIN });
    }
  } catch {
    send({ action: CONTEXT_MENU_ACTION.DO_LOGIN });
  }
};

export const initContextMenusEvent = () => {
  initEvents({
    contextMenus: {
      onSyncSelection: (tab) => {
        checkLoginAndSend(tab, CONTEXT_MENU_ACTION.SYNC_SELECTION);
      },
      onSyncImage: (tab, srcUrl) => {
        checkLoginAndSend(tab, CONTEXT_MENU_ACTION.SYNC_IMAGE, { srcUrl });
      },
      onSyncPage: (tab) => {
        checkLoginAndSend(tab, CONTEXT_MENU_ACTION.SYNC_PAGE);
      },
    },
    copy: true,
  });
};

import { initEvents } from '@gitcoffee/postbot-events';
import { CONTEXT_MENU_ACTION } from '@gitcoffee/postbot-actions';
import { user } from '@gitcoffee/postbot-api';

const checkLoginAndSend = async (tab: chrome.tabs.Tab | undefined, action: string, extra?: { srcUrl?: string }) => {
  if (!tab?.id) return;
  try {
    const res = await user.isLoginApi({});
    if (res?.data?.login) {
      chrome.tabs.sendMessage(tab.id, { action, ...extra });
    } else {
      chrome.tabs.sendMessage(tab.id, { action: CONTEXT_MENU_ACTION.DO_LOGIN });
    }
  } catch {
    chrome.tabs.sendMessage(tab.id, { action: CONTEXT_MENU_ACTION.DO_LOGIN });
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

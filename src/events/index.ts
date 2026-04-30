import { initEvents } from '@gitcoffee/postbot-events';
import { CONTEXT_MENU_ACTION } from '@gitcoffee/postbot-actions';

export const initContextMenusEvent = () => {
  initEvents({
    contextMenus: {
      onSyncSelection: (tab) => {
        chrome.tabs.sendMessage(tab?.id || 0, { action: CONTEXT_MENU_ACTION.SYNC_SELECTION });
      },
      onSyncImage: (tab, srcUrl) => {
        chrome.tabs.sendMessage(tab?.id || 0, { action: CONTEXT_MENU_ACTION.SYNC_IMAGE, srcUrl });
      },
      onSyncPage: (tab) => {
        chrome.tabs.sendMessage(tab?.id || 0, { action: CONTEXT_MENU_ACTION.SYNC_PAGE });
      },
    },
    copy: true,
  });
};

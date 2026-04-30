import { createTabsForPlatforms, tabsState } from '@gitcoffee/postbot-tabs';
import { executeScriptsToTabs } from '~media/publisher/publisher.script';

export { tabsState };

export const createTab = async (url: string) => {
    return await chrome.tabs.create({ url });
}

export const updateTab = async (tabId: number, value: any) => {
    await chrome.tabs.update(tabId, value);
}

export const createTabGroup = async (tabIds: number[]) => {
    return await chrome.tabs.group({ tabIds });
}

export const updateTabGroup = async (tabGroupId: number) => {
    await chrome.tabGroups.update(tabGroupId, {
        color: 'purple',
        title: `PostBot 内容同步助手`,
    });
}

export const addTabToTabGroup = async (tabIds: number[], groupId: number) => {
    await chrome.tabs.group({ tabIds, groupId });
}

export const createTabsForPlatformsWithScript = (data: any) => {
    return createTabsForPlatforms(data, executeScriptsToTabs, 'PostBot 内容同步助手');
}

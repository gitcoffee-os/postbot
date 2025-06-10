/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ref, reactive } from 'vue';

import { executeScriptsToTabs } from '~media/publisher/publisher.script';

export const tabsState = reactive({
    tabs: [],
    publishedTabs: [],
});

const getTabIds = () => {
    const tabIds = tabsState.publishedTabs.map((tab) => tab.tab.id).filter((id): id is number => id !== undefined);
    return tabIds;
}

export const createTab = async (url) => {
    return await chrome.tabs.create({ url });
}

export const updateTab = async (tabId, value) => {
    await chrome.tabs.update(tabId, value);
}

export const createTabGroup = async (tabIds) => {
    return await chrome.tabs.group({
        tabIds: tabIds,
    });
}

export const updateTabGroup = async (tabGroupId) => {
    await chrome.tabGroups.update(tabGroupId,
        {
            color: 'green',
            title: `PostBot发布助手`,
        }
    );
}

export const addTabToTabGroup = async (tabIds, groupId) => {
    await chrome.tabs.group({
        tabIds: tabIds,
        groupId,
    });
}

export const handleTabClick = (tabId) => {

}

export const handleReloadClick = async (tabId) => {

}

export const setPublishedTabs = async (tabId) => {

}

export const waitOnUpdatedTab = async (tab) => {
    await new Promise<void>((resolve) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab!.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        });
    });
}

export const createTabsForPlatforms = async (data) => {
    let tabs = [];
    let tabGroupId;

    for (const platform of data?.platforms) {
        if (!platform) {
            return;
        }
        let tab = null;

        let publishUrls = platform?.publishUrls;
        if (!publishUrls) {
            const publishUrl = platform?.publishUrl;
            let url = null;
            if (publishUrl instanceof Function) {
                url = publishUrl();
            } else {
                url = publishUrl;
            }
            publishUrls = [url];
        }

        for (const publishUrl of publishUrls) {

            tab = await createTab(publishUrl);

            executeScriptsToTabs([{ tab, platform }], data);

            await updateTab(tab.id!, { active: true });

            tabs.push({
                tab,
                platform,
            });

            if (!tabGroupId) {
                tabGroupId = await createTabGroup([tab.id!]);
                console.log('tabGroupId', tabGroupId);
                await updateTabGroup(tabGroupId);
            } else {
                await addTabToTabGroup([tab.id!], tabGroupId);
            }

            await waitOnUpdatedTab(tab);

        }

    };
}


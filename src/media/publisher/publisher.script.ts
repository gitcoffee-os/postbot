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
import { weixinArticlePublisher } from "./platform/article/weixin.publisher";
import { toutiaoArticlePublisher } from "./platform/article/toutiao.publisher";
import { xiaohongshuMomentPublisher } from "./platform/moment/xiaohongshu.publisher";
import { toutiaoMomentPublisher } from "./platform/moment/toutiao.publisher";
import { zhihuArticlePublisher } from "./platform/article/zhihu.publisher";
import { weiboArticlePublisher } from "./platform/article/weibo.publisher";
import { baijiahaoArticlePublisher } from "./platform/article/baijiahao.publisher";
import { douyinArticlePublisher } from "./platform/article/douyin.publisher";
import { bilibiliArticlePublisher } from "./platform/article/bilibili.publisher";
import { kuaishouMomentPublisher } from "./platform/moment/kuaishou.publisher";

const publisher = {
    article: {
        weixin: weixinArticlePublisher,
        toutiao: toutiaoArticlePublisher,
        xiaohongshu: xiaohongshuMomentPublisher,
        zhihu: zhihuArticlePublisher,
        weibo: weiboArticlePublisher,
        baijiahao: baijiahaoArticlePublisher,
        douyin: douyinArticlePublisher,
        bilibili: bilibiliArticlePublisher,
        kuaishou: kuaishouMomentPublisher,
    },
    moment: {
        xiaohongshu: xiaohongshuMomentPublisher,
        toutiao: toutiaoMomentPublisher,
        douyin: douyinArticlePublisher,
        bilibili: bilibiliArticlePublisher,
        kuaishou: kuaishouMomentPublisher,
    },
}

export const executeScriptsToTabs = (tabs, data) => {
    console.log('executeScriptsToTabs');
    tabs?.forEach(item => {
        const { tab, platform } = item;
        if (!tab?.id) {
            return;
        }
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            console.log('tabId', tab.id);
            console.log('info.status', info.status);
            if (tabId === tab.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                console.log('tab.id', tab.id);
                console.log('platform.type', platform.type);
                console.log('platform.code', platform.code);
                if (platform) {
                    platform['executeScript'] = publisher[platform.type][platform.code] || publisher['article'][platform.code];
                    const publisherData = {
                        data: data?.data,
                        platform: platform,
                    };
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: platform.executeScript,
                        args: [publisherData]
                    });
                }
            }
        });
    });
}
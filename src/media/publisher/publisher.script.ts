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
import { reactive } from "vue";

import { weixinArticlePublisher } from "./platform/article/weixin.publisher";
import { toutiaoArticlePublisher } from "./platform/article/toutiao.publisher";
import { xiaohongshuMomentPublisher } from "./platform/moment/xiaohongshu.publisher";
import { zhihuArticlePublisher } from "./platform/article/zhihu.publisher";
import { weiboArticlePublisher } from "./platform/article/weibo.publisher";
import { baijiahaoArticlePublisher } from "./platform/article/baijiahao.publisher";
import { qqOmArticlePublisher } from "./platform/article/qqOm.publisher";
import { douyinArticlePublisher } from "./platform/article/douyin.publisher";
import { bilibiliArticlePublisher } from "./platform/article/bilibili.publisher";
import { doubanArticlePublisher } from "./platform/article/douban.publisher";
import { jianshuArticlePublisher } from "./platform/article/jianshu.publisher";
import { zsxqArticlePublisher } from "./platform/article/zsxq.publisher";

import { weiboMomentPublisher } from "./platform/moment/weibo.publisher";
import { toutiaoMomentPublisher } from "./platform/moment/toutiao.publisher";
import { baijiahaoMomentPublisher } from "./platform/moment/baijiahao.publisher";
import { zhihuMomentPublisher } from "./platform/moment/zhihu.publisher";
import { weixinMomentPublisher } from "./platform/moment/weixin.publisher";
import { weixinChannelsMomentPublisher } from "./platform/moment/weixinChannels.publisher";
import { douyinMonmentPublisher } from "./platform/moment/douyin.publisher";
import { kuaishouMomentPublisher } from "./platform/moment/kuaishou.publisher";
import { doubanMomentPublisher } from "./platform/moment/douban.publisher";
import { zsxqMonmentPublisher } from "./platform/moment/zsxq.publisher";

import { douyinVideoPublisher } from "./platform/video/douyin.publisher";
import { kuaishouVideoPublisher } from "./platform/video/kuaishou.publisher";
import { bilibiliVideoPublisher } from "./platform/video/bilibili.publisher";
import { toutiaoVideoPublisher } from "./platform/video/toutiao.publisher";
import { weixinChannelsVideoPublisher } from "./platform/video/weixinChannels.publisher";
import { qqOmVideoPublisher } from "./platform/video/qqOm.publisher";
import { xiaohongshuVideoPublisher } from "./platform/video/xiaohongshu.publisher";
import { weiboVideoPublisher } from "./platform/video/weibo.publisher";
import { zhihuVideoPublisher } from "./platform/video/zhihu.publisher";

import { music163AudioPublisher } from "./platform/audio/music163.publisher";
import { qqmusicAudioPublisher } from "./platform/audio/qqmusic.publisher";
import { ximalayaAudioPublisher } from "./platform/audio/ximalaya.publisher";
import { qingtingAudioPublisher } from "./platform/audio/qingting.publisher";
import { lizhiAudioPublisher } from "./platform/audio/lizhi.publisher";
import { xiaoyuzhoufmAudioPublisher } from "./platform/audio/xiaoyuzhoufm.publisher";

export const publisher = reactive({
    article: {
        weixin: weixinArticlePublisher,
        toutiao: toutiaoArticlePublisher,
        xiaohongshu: xiaohongshuMomentPublisher,
        zhihu: zhihuArticlePublisher,
        weibo: weiboArticlePublisher,
        baijiahao: baijiahaoArticlePublisher,
        qq_om: qqOmArticlePublisher,
        weixin_channels: weixinChannelsMomentPublisher,
        douyin: douyinArticlePublisher,
        bilibili: bilibiliArticlePublisher,
        kuaishou: kuaishouMomentPublisher,
        douban: doubanArticlePublisher,
        jianshu: jianshuArticlePublisher,
        zsxq: zsxqArticlePublisher,
    },
    moment: {
        weibo: weiboMomentPublisher,
        toutiao: toutiaoMomentPublisher,
        xiaohongshu: xiaohongshuMomentPublisher,
        baijiahao: baijiahaoMomentPublisher,
        zhihu: zhihuMomentPublisher,
        weixin: weixinMomentPublisher,
        weixin_channels: weixinChannelsMomentPublisher,
        douyin: douyinMonmentPublisher,
        bilibili: bilibiliArticlePublisher,
        kuaishou: kuaishouMomentPublisher,
        douban: doubanMomentPublisher,
        zsxq: zsxqMonmentPublisher,
    },
    video: {
        douyin: douyinVideoPublisher,
        kuaishou: kuaishouVideoPublisher,
        bilibili: bilibiliVideoPublisher,
        toutiao: toutiaoVideoPublisher,
        weixin_channels: weixinChannelsVideoPublisher,
        qq_om: qqOmVideoPublisher,
        xiaohongshu: xiaohongshuVideoPublisher,
        weibo: weiboVideoPublisher,
        zhihu: zhihuVideoPublisher,
    },
    audio: {
        music163: music163AudioPublisher,
        qqmusic: qqmusicAudioPublisher,
        ximalaya: ximalayaAudioPublisher,
        qingting: qingtingAudioPublisher,
        lizhi: lizhiAudioPublisher,
        xiaoyuzhou: xiaoyuzhoufmAudioPublisher,
    }
});

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
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
import { reactive } from 'vue';

import { weixinMetaInfo } from './weixin.meta';
import { toutiaoMetaInfo } from './toutiao.meta';
import { xiaohongshuMetaInfo } from './xiaohongshu.meta';
import { zhihuMetaInfo } from './zhihu.meta';
import { weiboMetaInfo } from './weibo.meta';
import { baijiahaoMetaInfo } from './baijiahao.meta';
import { douyinMetaInfo } from './douyin.meta';
import { kuaishouMetaInfo } from './kuaishou.meta';
import { bilibiliMetaInfo } from './bilibili.meta';
import { weixinChannelsMetaInfo } from './weixinChannels.meta';
import { qqOmMetaInfo } from './qqOm.meta';
import { doubanMetaInfo } from './douban.meta';
import { jianshuMetaInfo } from './jianshu.meta';
import { zsxqMetaInfo } from './zsxq.meta';

export const metaInfoList = reactive({
    weixin: weixinMetaInfo,
    toutiao: toutiaoMetaInfo,
    xiaohongshu: xiaohongshuMetaInfo,
    zhihu: zhihuMetaInfo,
    weibo: weiboMetaInfo,
    baijiahao: baijiahaoMetaInfo,
    douyin: douyinMetaInfo,
    kuaishou: kuaishouMetaInfo,
    bilibili: bilibiliMetaInfo,
    weixin_channels: weixinChannelsMetaInfo,
    qq_om: qqOmMetaInfo,
    douban: doubanMetaInfo,
    jianshu: jianshuMetaInfo,
    zsxq: zsxqMetaInfo,
});

export const getMetaInfoList = async () => {
    const results = await Promise.all(
        Object.keys(metaInfoList).map(async (key) => {
            let metaInfo = {};
            const meta = metaInfoList[key];
            if (meta != null) {
                try {
                    const mediaInfo = await meta?.getMediaInfo();
                    if (mediaInfo) {
                        mediaInfo[key] = key;
                        const metaInfo = {
                            [key]: mediaInfo
                        };
                        return metaInfo;
                    } else {
                        return metaInfo;
                    }
                } catch (e) {
                    console.error('获取失败', e);
                    return metaInfo;
                }
            }
            return metaInfo;
        })
    );

    const metaInfos = results.reduce((acc, currentData) => {
        return { ...acc, ...currentData };  // 使用展开运算符合并对象
    }, {});

    return metaInfos;
}
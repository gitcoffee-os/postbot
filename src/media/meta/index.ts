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
import { weixinMetaInfo } from './weixin.meta';
import { toutiaoMetaInfo } from './toutiao.meta';
import { xiaohongshuMetaInfo } from './xiaohongshu.meta';
import { zhihuMetaInfo } from './zhihu.meta';
import { weiboMetaInfo } from './weibo.meta';

export const metaInfoList = {
    weixin: weixinMetaInfo,
    toutiao: toutiaoMetaInfo,
    xiaohongshu: xiaohongshuMetaInfo,
    zhihu: zhihuMetaInfo,
    weibo: weiboMetaInfo,
}

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
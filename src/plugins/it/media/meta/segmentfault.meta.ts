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

import { platformMetas } from "../platform";

import { getImageUrl } from "~utils/image";

const Api = {
    MediaInfo: platformMetas.segmentfault.mediaInfoUrl,
};

export const getSegmentFaultMetaInfo = (html) => {
    let userInfo = null;
    try {
        const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
        
        if (!jsonMatch) {
          throw new Error('未找到 __NEXT_DATA__ 脚本标签');
        }
    
        const jsonData = JSON.parse(jsonMatch[1]);
        
        // 提取 sessionUser 信息
        const sessionUser = jsonData.props?.pageProps?.initialState?.global?.sessionUser;
        
        if (!sessionUser || !sessionUser.user) {
          throw new Error('未找到 sessionUser 数据');
        }
    
        const user = sessionUser.user;
        
        // 如果 avatar_url 为空，从 HTML 中提取头像
        let avatarUrl = user.avatar_url;
        if (!avatarUrl) {
            const avatarMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*alt="头像"[^>]*>/);
            if (avatarMatch) {
                avatarUrl = avatarMatch[1];
            }
        }

        userInfo = {
          userId: user.id,
        //   username: user.slug,
          name: user.name,
          avatarUrl: getImageUrl(avatarUrl || '')
        };
    
    } catch (error) {
        console.error('解析失败:', error);
    }

    console.log('userInfo', userInfo);
    return userInfo;
}

const getMediaInfo = async () => {
    const response = await fetch(Api.MediaInfo, {
        method: 'GET',
    });
    if (response.ok) {
        const body = await response.text();
        console.log('body', body);

       const userInfo = await getSegmentFaultMetaInfo(body);
       console.log('userInfo', userInfo);
       return userInfo;
    }
    return null;
}

export const segmentfaultMetaInfo = {
    getMediaInfo,
}
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

import { platformMetas } from "~media/platform";
import { getImageUrl, imageDownloadToBase64 } from "~utils/image";

const Api = {
    MediaInfo: platformMetas.weibo.mediaInfoUrl,
};

const getWeiboMetaInfo = async(html) => {
    const regex = /window\.__WB_GET_CONFIG\s*=\s*function\s*\(\)\s*\{\s*var\s+configData\s*=\s*\{\s*config:\s*JSON\.parse\('([^']+)'\)/;
    const match = html.match(regex);
    
    if (!match) {
      return null;
    }
    
    try {
      const config = JSON.parse(match[1]);

      const { uid, nick, avatar_large } = config;

      const avatarUrl = decodeURI(avatar_large);

      let avatar = null;
      if(avatarUrl) {
        avatar = await imageDownloadToBase64(avatarUrl);
      }
      
      const userInfo = {
        userId: uid,
        name: nick,
        avatarUrl: getImageUrl(avatarUrl),
        avatar: avatar,
      };
      
      return userInfo;
    } catch (error) {
      console.error('解析信息失败:', error);
      return null;
    }
  }

const getMediaInfo = async () => {
    const response = await fetch(Api.MediaInfo, {
        method: 'GET',
    });
    if (response.ok) {
        const body = await response.text();
        console.log('body', body);

        // const userInfo = await getMetaInfo(body);
        const userInfo = await getWeiboMetaInfo(body);
        console.log('userInfo', userInfo);
        return userInfo;
    }
    return null;
}

export const weiboMetaInfo = {
    getMediaInfo,
}
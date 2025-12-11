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
    MediaInfo: platformMetas.cnblogs.mediaInfoUrl,
};

export const getCnBlogsMetaInfo = (html) => {

    const usernameRegex = /欢迎你，(\S+)\s*<\/h1>/;
    const usernameMatch = html.match(usernameRegex);
    const username = usernameMatch ? usernameMatch[1] : '';

    const avatarUrlRegex = /<img class="pfs" src="([^"]+)"/;
    const avatarUrlMatch = html.match(avatarUrlRegex);
    const avatarUrl = avatarUrlMatch ? avatarUrlMatch[1] : '';

    const nicknameRegex = /<a href="\/u\/\S+\/">([^<]+)<\/a>/;
    const nicknameMatch = html.match(nicknameRegex);
    const nickname = nicknameMatch ? nicknameMatch[1] : '';

    const userIdRegex = /<a href="\/u\/(\S+)\/">/;
    const userIdMatch = html.match(userIdRegex);
    const userId = userIdMatch ? userIdMatch[1] : '';
    
    const avatar = `https:${avatarUrl}`;

    const userInfo = {
        userId: userId,
        name: username,
        avatarUrl: getImageUrl(avatar),
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

       const userInfo = await getCnBlogsMetaInfo(body);
       console.log('userInfo', userInfo);
       return userInfo;
    }
    return null;
}

export const cnblogsMetaInfo = {
    getMediaInfo,
}
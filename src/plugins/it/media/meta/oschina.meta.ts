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

import { getDocument } from "~utils/html";
import { platformMetas } from "../platform";
import { getImageUrl } from "~utils/image";

const Api = {
    MediaInfo: platformMetas.oschina.mediaInfoUrl,
};

export const getOsChinaMetaInfo = (html) => {
    const userNameMatch = html.match(/data-name="g_user_name" data-value="([^"]+)"/);
    const userIdMatch = html.match(/data-name="g_user_id" data-value="([^"]+)"/);
    const userPortraitSmallMatch = html.match(/data-name="g_user_small_portrait" data-value="([^"]+)"/);
    const userPortraitLargeMatch = html.match(/data-name="g_user_large_portrait" data-value="([^"]+)"/);

    // 获取结果
    const userName = userNameMatch ? userNameMatch[1] : null;
    const userId = userIdMatch ? userIdMatch[1] : null;
    const userPortraitSmall = userPortraitSmallMatch ? userPortraitSmallMatch[1] : null;
    // const userPortraitLarge = userPortraitLargeMatch ? userPortraitLargeMatch[1] : null;
    
    const userInfo = {
        userId: userId,
        name: userName,
        avatarUrl: getImageUrl(userPortraitSmall),
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

       const userInfo = await getOsChinaMetaInfo(body);
       console.log('userInfo', userInfo);
       return userInfo;
    }
    return null;
}

export const oschinaMetaInfo = {
    getMediaInfo,
}
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

const Api = {
  MediaInfo: platformMetas.weixin_channels.mediaInfoUrl,
};

const getMediaInfo = async () => {

  const body = {
    "timestamp": Date.now(),
    "_log_finder_uin": "",
    "_log_finder_id": "",
    "rawKeyBuff": null,
    "pluginSessionId": null,
    "scene": 7,
    "reqScene": 7
  };
  
  const getTimestamp = () => {
    const timestamp = Math.floor(Date.now() / 1000); 
    // console.debug(timestamp.toString(16));  
    return timestamp.toString(16);  
  };
  
  const getRandomHex = () => {
    const randomHex = [...Array(8)]  
      .map(() => Math.floor(16 * Math.random()).toString(16)) 
      .join('');
    // console.debug(randomHex);  
    return randomHex;  
  };
  
  const url = `${Api.MediaInfo}?_aid=&_rid=${getTimestamp()}-${getRandomHex()}&_pageUrl=https:%2F%2Fchannels.weixin.qq.com%2Fplatform`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Sec-Fetch-Site': 'same-origin',
      'X-Wechat-Uin': '0000000000',
    },
    body: JSON.stringify(body),
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.errCode === 0) {
      const data = body?.data;
      const finderUser = data?.finderUser;
      const { uniqId, nickname, headImgUrl, adminNickname, finderUsername } = finderUser;
      return {
        userId: uniqId,
        name: nickname,
        avatarUrl: headImgUrl,
      }
    }
    return null;
  }
  return null;
}

export const weixinChannelsMetaInfo = {
  getMediaInfo,
}
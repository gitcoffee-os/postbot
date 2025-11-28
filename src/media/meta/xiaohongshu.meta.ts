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
import { platforms } from "~media/platform";

const Api = {
  MediaInfo: platforms.article.xiaohongshu.mediaInfoUrl,
  HomePage: platforms.article.xiaohongshu.homepage,
  Explor: platforms.article.xiaohongshu.exploreUrl,
};

// const getMediaInfo = async() => {
//     const response = await fetch(Api.MediaInfo, {
//         method: 'GET',
//         headers: {
//           'Referer': Api.HomePage,
//         }
//       });
//       if (response.ok) {
//         const body = await response.json();
//         console.log('body', body);
//         if (body.result === 0) {
//           const data = body?.data;
//           // const user = data?.user;
//           // const media = data?.media;
//           const { userId, userName, redId, userAvatar, phone } = data;
//           return {
//             name: userName,
//             avatarUrl: userAvatar,
//             userId: userId,
//             username: redId,
//             phone: phone,
//           };
//         }
//         return null;
//       }
//       return null;
// }

const getMetaInfo = (html) => {
  const match = html.match(/window\.__INITIAL_STATE__=(\{.+?\})(?:<\/script>|;)/s);
  console.log('match', match);
  if (match) {
    const json = match[1].replace(/undefined/g, 'null');
    const data = JSON.parse(json);
    console.log(data);
    return data?.user.userInfo;
  } else {
    throw new Error('获取失败');
  }
}

const getMediaInfo = async () => {
  const response = await fetch(Api.Explor, {
    method: 'GET',
  });

  if (response.ok) {
    const body = await response.text();
    console.log('body', body);
    const userInfo = getMetaInfo(body);
    const { userId, nickname, redId, images, desc } = userInfo;
    return {
      name: nickname,
      avatarUrl: images,
      userId: userId,
      username: redId,
      // phone: phone,
      profile: desc,
    };
  } else {
    throw new Error('获取失败');
  }
}

export const xiaohongshuMetaInfo = {
  getMediaInfo,
}
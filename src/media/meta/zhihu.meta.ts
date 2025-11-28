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
  MediaInfo: platforms.article.zhihu.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
      const data = body;
      const { id, uid, name, avatar_url, phone } = data;
      return {
        userId: uid,
        name: name,
        avatarUrl: avatar_url,
        // phone: phone,
      }
    }
    return null;
}

export const zhihuMetaInfo = {
  getMediaInfo,
}
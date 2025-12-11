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
  MediaInfo: platformMetas.baijiahao.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.errno === 0) {
      const data = body?.data;
      const user = data.user;
      const { userid, name, username, avatar } = user;
      return {
        userId: userid,
        name: name,
        avatarUrl: avatar,
      }
    }
    return null;
  }
  return null;
}

export const baijiahaoMetaInfo = {
  getMediaInfo,
}
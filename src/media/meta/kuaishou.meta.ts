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
  MediaInfo: platformMetas.kuaishou.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    "headers": {
      "content-type": "application/json",
    },
    "body": JSON.stringify({"operationName":"userInfoQuery","variables":{},"query":"query userInfoQuery {\n  userInfo {\n    id\n    name\n    avatar\n    eid\n    userId\n    __typename\n  }\n}\n"}),
    "method": "POST",
    "credentials": "include"
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.data && body.data.userInfo) {
      const user = body.data.userInfo;
      const { id, eid, userId, name, avatar } = user;
      return {
        userId: userId,
        name: name,
        avatarUrl: avatar,
      }
    }
    return null;
  }
  return null;
}

export const kuaishouMetaInfo = {
  getMediaInfo,
}
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
  MediaInfo: platformMetas.csdn.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.code === 200) {
      const data = body?.data;

      return {
        name: data?.nickName,
        avatarUrl: getImageUrl(data?.avatar),
        userId: data?.username,
        blogUrl: data?.blog_url,
      }
    }
    return null;
  }
  return null;
}

export const csdnMetaInfo = {
  getMediaInfo,
}
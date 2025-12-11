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

import { imageToBase64 } from "~utils/image";

const Api = {
  MediaInfo: platformMetas.zsxq.mediaInfoUrl,
  HomePage: platformMetas.zsxq.homepage,
  Groups: platformMetas.zsxq.groupsUrl,
};

const getGroups = async () => {
  const response = await fetch(Api.Groups, {
    method: 'GET',
    headers: {
      'Accep': 'application/json',
      'Content-Type': 'application/json',
      'Origin': Api.HomePage,
      'Referer': Api.HomePage,
    },
    credentials: 'include',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.succeeded) {
      const data = body.resp_data;
      return data?.groups;
    }

    return null;
  }
  return null;
}

const getMediaInfo = async () => {
  const res = await fetch(Api.HomePage);
  console.log('res', res);
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
    headers: {
      'Accep': 'application/json',
      'Content-Type': 'application/json',
      'Origin': Api.HomePage,
      'Referer': Api.HomePage,
    },
    credentials: 'include',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);

    if (body.succeeded) {

      let groups = await getGroups();
      console.log('groups', groups);
      if (groups) {
        groups = groups.map(group => ({
          groupId: group.group_id,
          name: group.name,
          iconUrl: group.background_url,
        }))
      }

      const data = body.resp_data;
      const { user, accounts } = data;
      const { phone, wechat } = accounts;

      const avatarUrl = user?.avatar_url;
      let avatar = null;
      if (avatarUrl) {
        const headers = {
          'Origin': Api.HomePage,
          'Referer': Api.HomePage,
        };
        avatar = await imageToBase64(avatarUrl);
      }
      console.log('avatar', avatar);
      return {
        name: user?.name,
        avatarUrl: user?.avatar_url,
        avatar: avatar,
        userId: user?.user_id,
        username: user?.user_sid,
        introduction: user?.introduction,
        groups: groups,
      }
    }
    return {
      groups: groups,
    };
  }
  return null;
}

export const zsxqMetaInfo = {
  getMediaInfo,
}
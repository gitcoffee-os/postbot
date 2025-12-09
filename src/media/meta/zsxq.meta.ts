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
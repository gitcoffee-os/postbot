import { platformMetas } from "../platform";

import { imageToBase64 } from "~utils/image";

const Api = {
  MediaInfo: platformMetas.$51cto.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.data.status === 'success') {
      const data = body?.data?.data;
      const { user_id, nickname, avatar } = data;
      return {
        userId: user_id,
        name: nickname,
        avatarUrl: avatar,
        // avatar: imageToBase64(avatar),
      }
    }
    return null;
  }
  return null;
}

export const $51ctoMetaInfo = {
  getMediaInfo,
}
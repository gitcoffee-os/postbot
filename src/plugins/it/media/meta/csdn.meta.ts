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
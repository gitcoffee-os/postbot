import { platformMetas } from "~media/platform";

const Api = {
  MediaInfo: platformMetas.douyin.mediaInfoUrl,
};

const USER_BASE_URL = 'https://www.douyin.com/user'

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.status_code === 0) {
      const user = body?.user;
      const { uid, nickname, avatar_thumb } = user;
      return {
        userId: uid,
        name: nickname,
        avatarUrl: avatar_thumb.url_list[0],
        // profile: signature,
      }
    }
    return null;
  }
  return null;
}

export const douyinMetaInfo = {
  getMediaInfo,
}
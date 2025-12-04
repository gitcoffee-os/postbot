import { platforms } from "~media/platform";

const Api = {
  MediaInfo: platforms.article.baijiahao.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.errno !== 10001401) {
      const data = body?.data;
      const { user_id, user_name, avatar_large, phone } = data;
      return {
        userId: user_id,
        name: user_name,
        avatarUrl: avatar_large,
        phone: phone,
      }
    }
    return null;
  }
  return null;
}

export const baijiahaoMetaInfo = {
  getMediaInfo,
}
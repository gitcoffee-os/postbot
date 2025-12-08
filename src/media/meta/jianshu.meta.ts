import { platforms } from "~media/platform";
import { getImageUrl } from "~utils/image";

const Api = {
  MediaInfo: platforms.article.jianshu.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body?.data) {
      const data = body?.data;
      const { nickname, avatar } = data;
      return {
        name: nickname,
        avatarUrl: getImageUrl(avatar),
      }
    }
    return null;
  }
  return null;
}

export const jianshuMetaInfo = {
  getMediaInfo,
}
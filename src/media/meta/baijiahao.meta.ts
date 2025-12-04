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
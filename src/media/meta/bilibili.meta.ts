import { platformMetas } from "~media/platform";
import { imageToBase64 } from "~utils/image";

const Api = {
  MediaInfo: platformMetas.bilibili.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.code === 0 && body.data.isLogin) {
      const data = body?.data;
      const { mid, uname, face } = data;

      const avatar = await imageToBase64(face);  

      return {
        userId: mid,
        name: uname,
        avatarUrl: face,
        avatar: avatar,
        profile: `https://space.bilibili.com/${mid}`,
      }
    }
    return null;
  }
  return null;
}

export const bilibiliMetaInfo = {
  getMediaInfo,
}
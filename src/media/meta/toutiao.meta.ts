import { platforms } from "~media/platform";

const Api = {
  MediaInfo: platforms.article.toutiao.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.code === 0) {
      const data = body?.data;
      const { user, media } = data;
      return {
        name: user?.screen_name || media?.display_name,
        avatarUrl: user?.https_avatar_url || media?.https_avatar_url,
        userId: user?.id_str || media?.id_str,
      }
    }
    return null;
  }
  return null;
}

export const toutiaoMetaInfo = {
  getMediaInfo,
}
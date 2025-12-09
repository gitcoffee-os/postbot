import { platformMetas } from "~media/platform";

const Api = {
  MediaInfo: platformMetas.douban.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    method: 'GET',
  });
  if (response.ok) {
    const body = await response.text();
    console.log('body', body);

    const userNameMatch = body.match(/_USER_NAME\s*=\s*'([^']+)'/);
    const userAvatarMatch = body.match(/_USER_AVATAR\s*=\s*'([^']+)'/);

    const userName = userNameMatch ? userNameMatch[1] : null;
    const userAvatar = userAvatarMatch ? userAvatarMatch[1] : null;

    if (userName && userAvatar) {
      return {
        name: userName,
        avatarUrl: userAvatar,
      }
    }

    return null;
  }
  return null;
}

export const doubanMetaInfo = {
  getMediaInfo,
}
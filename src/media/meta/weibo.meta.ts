import { platformMetas } from "~media/platform";
import { getImageUrl, imageDownloadToBase64 } from "~utils/image";

const Api = {
    MediaInfo: platformMetas.weibo.mediaInfoUrl,
};

const getWeiboMetaInfo = async(html) => {
    const regex = /window\.__WB_GET_CONFIG\s*=\s*function\s*\(\)\s*\{\s*var\s+configData\s*=\s*\{\s*config:\s*JSON\.parse\('([^']+)'\)/;
    const match = html.match(regex);
    
    if (!match) {
      return null;
    }
    
    try {
      const config = JSON.parse(match[1]);

      const { uid, nick, avatar_large } = config;

      const avatarUrl = decodeURI(avatar_large);

      let avatar = null;
      if(avatarUrl) {
        avatar = await imageDownloadToBase64(avatarUrl);
      }
      
      const userInfo = {
        userId: uid,
        name: nick,
        avatarUrl: getImageUrl(avatarUrl),
        avatar: avatar,
      };
      
      return userInfo;
    } catch (error) {
      console.error('解析信息失败:', error);
      return null;
    }
  }

const getMediaInfo = async () => {
    const response = await fetch(Api.MediaInfo, {
        method: 'GET',
    });
    if (response.ok) {
        const body = await response.text();
        console.log('body', body);

        // const userInfo = await getMetaInfo(body);
        const userInfo = await getWeiboMetaInfo(body);
        console.log('userInfo', userInfo);
        return userInfo;
    }
    return null;
}

export const weiboMetaInfo = {
    getMediaInfo,
}
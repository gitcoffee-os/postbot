import { getDocument } from "~utils/html";
import { platformMetas } from "../platform";
import { getImageUrl } from "~utils/image";

const Api = {
    MediaInfo: platformMetas.oschina.mediaInfoUrl,
};

export const getOsChinaMetaInfo = (html) => {
    const userNameMatch = html.match(/data-name="g_user_name" data-value="([^"]+)"/);
    const userIdMatch = html.match(/data-name="g_user_id" data-value="([^"]+)"/);
    const userPortraitSmallMatch = html.match(/data-name="g_user_small_portrait" data-value="([^"]+)"/);
    const userPortraitLargeMatch = html.match(/data-name="g_user_large_portrait" data-value="([^"]+)"/);

    // 获取结果
    const userName = userNameMatch ? userNameMatch[1] : null;
    const userId = userIdMatch ? userIdMatch[1] : null;
    const userPortraitSmall = userPortraitSmallMatch ? userPortraitSmallMatch[1] : null;
    // const userPortraitLarge = userPortraitLargeMatch ? userPortraitLargeMatch[1] : null;
    
    const userInfo = {
        userId: userId,
        name: userName,
        avatarUrl: getImageUrl(userPortraitSmall),
    }
    console.log('userInfo', userInfo);
    return userInfo;
}

const getMediaInfo = async () => {
    const response = await fetch(Api.MediaInfo, {
        method: 'GET',
    });
    if (response.ok) {
        const body = await response.text();
        console.log('body', body);

       const userInfo = await getOsChinaMetaInfo(body);
       console.log('userInfo', userInfo);
       return userInfo;
    }
    return null;
}

export const oschinaMetaInfo = {
    getMediaInfo,
}
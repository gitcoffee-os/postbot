import { platformMetas } from "../platform"; 

import { getImageUrl } from "~utils/image";

const Api = {
    MediaInfo: platformMetas.cnblogs.mediaInfoUrl,
};

export const getCnBlogsMetaInfo = (html) => {

    const usernameRegex = /欢迎你，(\S+)\s*<\/h1>/;
    const usernameMatch = html.match(usernameRegex);
    const username = usernameMatch ? usernameMatch[1] : '';

    const avatarUrlRegex = /<img class="pfs" src="([^"]+)"/;
    const avatarUrlMatch = html.match(avatarUrlRegex);
    const avatarUrl = avatarUrlMatch ? avatarUrlMatch[1] : '';

    const nicknameRegex = /<a href="\/u\/\S+\/">([^<]+)<\/a>/;
    const nicknameMatch = html.match(nicknameRegex);
    const nickname = nicknameMatch ? nicknameMatch[1] : '';

    const userIdRegex = /<a href="\/u\/(\S+)\/">/;
    const userIdMatch = html.match(userIdRegex);
    const userId = userIdMatch ? userIdMatch[1] : '';
    
    const avatar = `https:${avatarUrl}`;

    const userInfo = {
        userId: userId,
        name: username,
        avatarUrl: getImageUrl(avatar),
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

       const userInfo = await getCnBlogsMetaInfo(body);
       console.log('userInfo', userInfo);
       return userInfo;
    }
    return null;
}

export const cnblogsMetaInfo = {
    getMediaInfo,
}
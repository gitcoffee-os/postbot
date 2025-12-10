import { platformMetas } from "../platform";

import { getImageUrl } from "~utils/image";

const Api = {
    MediaInfo: platformMetas.segmentfault.mediaInfoUrl,
};

export const getSegmentFaultMetaInfo = (html) => {
    let userInfo = null;
    try {
        const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
        
        if (!jsonMatch) {
          throw new Error('未找到 __NEXT_DATA__ 脚本标签');
        }
    
        const jsonData = JSON.parse(jsonMatch[1]);
        
        // 提取 sessionUser 信息
        const sessionUser = jsonData.props?.pageProps?.initialState?.global?.sessionUser;
        
        if (!sessionUser || !sessionUser.user) {
          throw new Error('未找到 sessionUser 数据');
        }
    
        const user = sessionUser.user;
        
        // 如果 avatar_url 为空，从 HTML 中提取头像
        let avatarUrl = user.avatar_url;
        if (!avatarUrl) {
            const avatarMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*alt="头像"[^>]*>/);
            if (avatarMatch) {
                avatarUrl = avatarMatch[1];
            }
        }

        userInfo = {
          userId: user.id,
        //   username: user.slug,
          name: user.name,
          avatarUrl: getImageUrl(avatarUrl || '')
        };
    
    } catch (error) {
        console.error('解析失败:', error);
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

       const userInfo = await getSegmentFaultMetaInfo(body);
       console.log('userInfo', userInfo);
       return userInfo;
    }
    return null;
}

export const segmentfaultMetaInfo = {
    getMediaInfo,
}
import { platforms } from "~media/platform";

const Api = {
  MediaInfo: platforms.article.xiaohongshu.mediaInfoUrl,
  HomePage: platforms.article.xiaohongshu.homepage,
  Explor: platforms.article.xiaohongshu.exploreUrl,
};

// const getMediaInfo = async() => {
//     const response = await fetch(Api.MediaInfo, {
//         method: 'GET',
//         headers: {
//           'Referer': Api.HomePage,
//         }
//       });
//       if (response.ok) {
//         const body = await response.json();
//         console.log('body', body);
//         if (body.result === 0) {
//           const data = body?.data;
//           // const user = data?.user;
//           // const media = data?.media;
//           const { userId, userName, redId, userAvatar, phone } = data;
//           return {
//             name: userName,
//             avatarUrl: userAvatar,
//             userId: userId,
//             username: redId,
//             phone: phone,
//           };
//         }
//         return null;
//       }
//       return null;
// }

const getMetaInfo = (html) => {
  const match = html.match(/window\.__INITIAL_STATE__=(\{.+?\})(?:<\/script>|;)/s);
  console.log('match', match);
  if (match) {
    const json = match[1].replace(/undefined/g, 'null');
    const data = JSON.parse(json);
    console.log(data);
    return data?.user.userInfo;
  } else {
    throw new Error('获取失败');
  }
}

const getMediaInfo = async () => {
  const response = await fetch(Api.Explor, {
    method: 'GET',
  });

  if (response.ok) {
    const body = await response.text();
    console.log('body', body);
    const userInfo = getMetaInfo(body);
    const { userId, nickname, redId, images, desc } = userInfo;
    return {
      name: nickname,
      avatarUrl: images,
      userId: userId,
      username: redId,
      // phone: phone,
      profile: desc,
    };
  } else {
    throw new Error('获取失败');
  }
}

export const xiaohongshuMetaInfo = {
  getMediaInfo,
}
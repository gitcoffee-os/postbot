import { platforms } from "~media/platform";

const Api = {
  MediaInfo: platforms.article.kuaishou.mediaInfoUrl,
};

const getMediaInfo = async () => {
  const response = await fetch(Api.MediaInfo, {
    "headers": {
      "content-type": "application/json",
    },
    "body": JSON.stringify({"operationName":"userInfoQuery","variables":{},"query":"query userInfoQuery {\n  userInfo {\n    id\n    name\n    avatar\n    eid\n    userId\n    __typename\n  }\n}\n"}),
    "method": "POST",
    "credentials": "include"
  });
  if (response.ok) {
    const body = await response.json();
    console.log('body', body);
    if (body.data && body.data.userInfo) {
      const user = body.data.userInfo;
      const { id, eid, userId, name, avatar } = user;
      return {
        userId: userId,
        name: name,
        avatarUrl: avatar,
      }
    }
    return null;
  }
  return null;
}

export const kuaishouMetaInfo = {
  getMediaInfo,
}
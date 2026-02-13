/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { state } from "~contents/components/postbot.data";

import { POSTBOT_ACTION } from "../message/postbot.action";

// import { checkExtensionStatus } from "~utils/extenstion";

import type { PlasmoCSConfig } from "plasmo"
import { getPlatforms } from "~media/platform";
import { getMetaInfoList } from "~media/meta";
import { windowPublish } from "~media/publisher";

import { isLoginApi } from "~api/media/user.api";

export const handleMessage = async (request, sender, sendResponse) => {
    try {
        let message = {};
        const data = request?.data;
        switch (request.action) {
            case POSTBOT_ACTION.CHECK_EXTENSION:
                message = {
                    extensionId: chrome.runtime.id,
                    // enabled: enabled,
                };
                sendResponse(message);
                break;
            case POSTBOT_ACTION.PLATFORM_LIST:
                const platforms = getPlatforms();
                console.log('platforms', platforms);
                message = {
                    platforms: platforms[data?.type],
                }
                sendResponse(message);
                break;
            case POSTBOT_ACTION.META_INFO_LIST:

                // chrome.runtime.sendMessage({ action: 'getMetaInfoList' }, (response) => {
                //   console.log('response', response);
                const metaInfoList = await getMetaInfoList();
                state.metaInfoList = metaInfoList;
                message = {
                    metaInfoList: metaInfoList,
                }
                console.log('message', message);
                sendResponse(message);
                // return true;
                // });
                break;
            case POSTBOT_ACTION.PUBLISH_SYNC_DATA:
                console.debug('request.data', request.data);
                state.contentData = request.data;
                sendResponse({ ok: true });
                break;
            case POSTBOT_ACTION.PUBLISH_SYNC_CONTENT:
                console.debug('state.contentData', state.contentData);
                message = state.contentData;

                sendResponse(message);

                state.contentData = null;
                break;
            case POSTBOT_ACTION.PUBLISH_NOW:
                const mediaType = data.mediaType || 'article'
                const platformCodes = data.platformCodes;
                console.debug('platformCodes', platformCodes);
                const publishPlatforms = getPlatforms();
                console.debug('publishPlatforms', publishPlatforms);

                let allPlatforms = Object.values(publishPlatforms[mediaType]);
                const checkedPlatforms = allPlatforms.filter(item => platformCodes.includes(item.code));
                console.debug('checkedPlatforms', checkedPlatforms);

                checkedPlatforms.forEach(item => {
                    item['metaInfo'] = state.metaInfoList[item.code];
                });

                const publishData = {
                    platforms: checkedPlatforms,
                    data: data,
                }
                windowPublish(publishData);
                sendResponse({ ok: true });
                break;
            case 'fetchImage':
                let imageType = null;
                fetch(data.imageUrl)
                    .then((response) => {
                        const imageName = getFileName(response);
                        // 获取图片的 Blob
                        response.blob().then((blob) => {
                            imageType = blob.type;
                            console.log('blob.type', blob.type);
                            console.log('blob.size', blob.size);
                            // sendResponse({ imageName: imageName, imageBlob: blob });
                            // blobToArrayBuffer(blob)
                            //   .then(arrayBuffer => {
                            // 发送 ArrayBuffer 到 content.js

                            // })
                            // .catch(err => {
                            //   console.error('转换 Blob 为 ArrayBuffer 失败:', err);
                            // });

                            blob2base64(blob).then((base64data) => {
                                sendResponse({ imageName: imageName, base64data: base64data, imageType: imageType });
                            });


                        })
                    })
                    .catch((error) => {
                        console.error('获取图片失败:', error);
                        sendResponse({ error: error.message });
                    });
                break;
            case 'checkLogin':
                const res = await isLoginApi({});
                console.debug('res', res);
                sendResponse({
                    isLogin: res?.data?.login,
                });
                break;
            default:
                sendResponse({});
                break;
        }
    } catch (e: any) {
        sendResponse({ error: e?.message ?? String(e) });
    }
}

const getFileName = (response) => {
    const disposition = response.headers.get('Content-Disposition');
    let filename = null;

    if (disposition && disposition.indexOf('attachment') !== -1) {
        const matches = /filename="([^;]+)"/.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1];
        }
    }
    return filename;
}

// function blobToArrayBuffer(blob) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result);
//     reader.onerror = reject;
//     reader.readAsArrayBuffer(blob);
//   });
// }

const blob2base64 = async (blob) => {
    return new Promise((resolve, reject) => {
        // 创建 FileReader 实例
        const reader = new FileReader();

        // 读取 Blob 数据为 Base64
        reader.onloadend = () => {
            const base64data = reader.result;
            console.log(base64data); // 输出 Base64 编码的字符串
            resolve(base64data);
        };

        reader.onerror = function (e) {
            reject(e)
        };

        // 开始读取 Blob 数据
        reader.readAsDataURL(blob);
    });
}
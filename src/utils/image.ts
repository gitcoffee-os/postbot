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

const BAIDU_DOWNLOAD_URL = 'https://image.baidu.com/search/down?url=';
const WORD_PRESS_IMAGE_DOMAIN = 'i0.wp.com';

export const getImageDownloadUrl = (imageUrl) => {
    return BAIDU_DOWNLOAD_URL + imageUrl;
}

export const getImageUrl = (url) => {
    const regex = /^(https?:\/\/)([^\/]+)(\/.*)$/;
    const match = url.match(regex);
    if (match) {
      const protocol = match[1];
      const domain = match[2];
      const path = match[3];
      return `${protocol}${WORD_PRESS_IMAGE_DOMAIN}/${domain}${path}`;
    }
    return url;
}

export const imageToBase64 = async (imageUrl) => {
    let imageBase64 = null;
    try {
        // 发送请求获取图片数据
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error('网络响应失败');
        }

        // 获取图片的 Blob
        const imageBlob = await response.blob();

        // 使用 FileReader 将 Blob 转换为 base64 编码（仍是异步的）
        const reader = new FileReader();

        // 返回一个 Promise 来包裹异步操作
        const base64Data = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result); // 读取成功，返回 base64 编码
            reader.onerror = reject; // 读取失败，拒绝 Promise
            reader.readAsDataURL(imageBlob); // 异步读取 Blob
        });

        // 将转换后的 base64 数据存储在 imageBase64 中
        console.log('base64Data', base64Data);
        imageBase64 = base64Data;
    } catch (error) {
        console.error('获取图片失败:', error);
    }
    return imageBase64;
}

export const imageDownloadToBase64 = async (imageUrl) => {
    const url = getImageDownloadUrl(imageUrl);
    return await imageToBase64(url);
}
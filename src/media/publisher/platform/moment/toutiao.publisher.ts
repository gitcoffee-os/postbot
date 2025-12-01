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
export const toutiaoMomentPublisher = async (data) => {
    console.log('toutiaoMomentPublisher data', data);

    const contentData = data?.data;
    const processedData = data?.data;

    const sleep = async (time) => {
        console.log('sleep', time);
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    const pasteEvent = (): ClipboardEvent => {
        console.log('pasteEvent');
        return new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: new DataTransfer(),
        });
    }

    const observeElement = (selector, timeout = 10000) => {
        console.log('observeElement', selector);
        return new Promise((resolve, reject) => {
            let checkElement = null;
            if (selector instanceof Function) {
                checkElement = selector;
            } else {
                checkElement = () => document.querySelector(selector);
            }

            // 立即检查元素
            let element = checkElement();
            console.log('element', element);
            if (element) {
                resolve(element);
                return;
            }

            // 创建 MutationObserver 进行监听
            const observer = new MutationObserver(() => {
                element = checkElement();
                console.log('element', element);
                if (element) {
                    resolve(element);
                    observer.disconnect();
                }
            });

            // 启动观察
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });

            // 如果超时，拒绝 Promise，并返回中文错误提示
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`未能在 ${timeout} 毫秒内找到选择器为 "${selector}" 的元素`));
            }, timeout);
        });
    };

    const formElement = {
        editor: 'textarea[placeholder="分享新鲜事..."]',
        imageUpload: 'input[type="file"]',
        imageUploadButton: 'button[data-e2e="microblog-image-upload-btn"]',
        publishButton: 'button[data-e2e="microblog-publish-btn"]',
        publishButtonText: '发布',
    }

    const fromRule = {
        content: {
            min: 1,
            max: 2000,
        }
    }

    const base64ToBinary = (base64) => {
        const binaryString = atob(base64);  // 解码Base64
        const byteArray = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }

        return byteArray;
    }

    const fetchImage = async (imageUrl) => {
        return new Promise((resolve, reject) => {
            // 发送消息到背景脚本，要求获取图片内容
            chrome.runtime.sendMessage({
                type: 'request',
                action: 'fetchImage',
                data: {
                    imageUrl: imageUrl
                }
            }, (response) => {
                console.log('response', response);
                const base64data = response.base64data;
                if (base64data) {
                    const dataPairs = base64data.split(',');
                    const fileType = dataPairs[0].replace('data:', '').split(';')[0];
                    const base64 = dataPairs[1];
                    const imageData = {
                        type: fileType || 'image/jpg',
                        bits: base64ToBinary(base64),
                        overwrite: true,
                        src: imageUrl,
                        fileName: response.imageName
                    }
                    console.log('imageData', imageData);
                    console.log('获取图片成功');
                    resolve(imageData);
                } else {
                    console.log('获取图片失败');
                    reject('获取图片失败');
                }
            });
        });
    }

    const getFileName = (fileName, url) => {
        let newFileName = fileName;
        console.log('fileName', fileName);
        if (!fileName) {
            const name = url.substring(url.lastIndexOf('/') + 1);
            if (name.indexOf('.') !== -1) {
                newFileName = name;
            }
        }

        if (!fileName) {
            newFileName = `${Date.now()}.jpg`;
        }
        console.log('newFileName', newFileName);
        return newFileName;
    }

    const uploadImages = async (images) => {
        console.log('images', images);

        const imageUploadButton = await observeElement(formElement.imageUploadButton);
        if (!imageUploadButton) {
            throw new Error('未找到图片上传按钮');
        }

        // 点击图片上传按钮
        imageUploadButton.click();
        await sleep(1000);

        const imageUpload = await observeElement(formElement.imageUpload);
        if (!imageUpload) {
            throw new Error('未找到图片上传元素');
        }

        console.log('imageUpload', imageUpload);

        const dataTransfer = new DataTransfer();

        for (const image of images) {
            const url = image?.url || image?.src;
            const imageData = await fetchImage(url);

            let fileName = imageData.fileName;
            if (!fileName) {
                fileName = getFileName(fileName, url);
            }

            const blob = new Blob([imageData.bits], { type: imageData.type });
            const file = new File([blob], fileName, { type: imageData.type });
            dataTransfer.items.add(file);
        }

        if (dataTransfer.files.length === 0) {
            console.error('上传文件失败');
            return;
        }

        imageUpload.files = dataTransfer.files;
        imageUpload.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(2000);
        console.log('图片上传成功');
    }

    const autoFillContent = async (contentData) => {
        const editor = await observeElement(formElement.editor);
        console.log('editor', editor);
        if (!editor) {
            console.log('未找到编辑器');
            return;
        }
        editor.focus();

        // 填写内容
        const content = contentData?.content?.slice(0, fromRule.content.max) || '';
        (editor as HTMLTextAreaElement).value = content;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const autoPublish = async () => {
        console.log('autoPublish');
        const publishButton = await observeElement(formElement.publishButton);
        if (publishButton && publishButton.textContent?.includes(formElement.publishButtonText)) {
            console.log('自动点击发布');
            publishButton.click();
            await sleep(5000);
        }
    }

    await observeElement(formElement.editor);
    await sleep(1000);

    // 先上传图片（如果有）
    if (contentData?.images && contentData.images.length > 0) {
        await uploadImages(contentData.images);
        await sleep(2000);
    }

    // 填写内容
    await autoFillContent(contentData);

    // 如果开启自动发布
    if (contentData.isAutoPublish) {
        await sleep(3000);
        autoPublish();
    }

}

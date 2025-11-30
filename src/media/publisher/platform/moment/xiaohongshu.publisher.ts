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
export const xiaohongshuMomentPublisher = async (data) => {
    console.log('xiaohongshuMomentPublisher data', data);

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
            //   const checkElement = () => document.querySelector(selector);

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
        uploadButtons: 'span[class="title"]',
        uploadImageButtonText: '上传图文',
        uploadVideoButtonText: '上传视频',
        imageUpload: 'input[type="file"]',
        title: 'input[type="text"]',
        editor: 'div[contenteditable="true"]',
        submitButton: 'button',
        publishButtonText: '发布',
        draftButtonText: '暂存离开',
    }

    const fromRule = {
        title: {
            min: 2,
            max: 64,
        },
        content: {
            min: 2,
            max: 1000,
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
        const titleElement = await observeElement(formElement.title);
        if (titleElement) {
            const title = contentData?.title?.slice(0, fromRule.title.max) || '';
            (titleElement as HTMLTextAreaElement).value = title;
            titleElement.dispatchEvent(new Event('input', { bubbles: true }));
            titleElement.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const editor = (await observeElement(formElement.editor)) as HTMLElement;
        console.log('editor', editor);
        if (!editor) {
            console.log('未找到编辑器');
            return;
        }
        editor.focus();

        // editor.innerHTML = contentData?.content;
        // editor.dispatchEvent(new Event('input', { bubbles: true }));
        // editor.dispatchEvent(new Event('change', { bubbles: true }));

        const editorPasteEvent = pasteEvent();
        editorPasteEvent.clipboardData.setData('text/html', contentData?.content);
        editor.dispatchEvent(editorPasteEvent);
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const autoPublish = async () => {
        console.log('autoPublish');
        const buttons = document.querySelectorAll(formElement.submitButton);
        const publishButton = Array.from(buttons).find((button) => button.textContent?.includes(formElement.publishButtonText));
        if (publishButton) {
            console.log('自动点击发布');
            publishButton.click();
            await sleep(5000);
            window.location.href = 'https://creator.xiaohongshu.com/new/note-manager';
        }
    }

    await observeElement(formElement.uploadButtons);
    await sleep(1000);

    const uploadButtons = document.querySelectorAll(formElement.uploadButtons);

    const uploadImageButton = Array.from(uploadButtons).find(
        (element) => element.textContent?.includes(formElement.uploadImageButtonText),
    );

    if (!uploadImageButton) {
        throw new Error(`未找到${formElement.uploadImageButtonText}按钮元素`);
    }

    uploadImageButton.click();
    uploadImageButton.dispatchEvent(new Event('click', { bubbles: true }));
    await sleep(1000);

    await uploadImages(contentData?.images || contentData?.contentImages);
    await sleep(5000);

    await autoFillContent(contentData);

    if (contentData.isAutoPublish) {
        await sleep(5000);
        autoPublish();
    }

}
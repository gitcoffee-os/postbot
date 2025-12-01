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
import { content } from "~utils/content";

const getToken = () => {
    return state.metaInfoList?.weixin?.token;
}

const getTicket = () => {
    return state.metaInfoList?.weixin?.ticket;
}

const getUsername = () => {
    return state.metaInfoList?.weixin?.username;
}

export const getNewPublishUrl = () => {
    const token = getToken();
    const ticket = getTicket();
    const username = getUsername();
    const publishUrl = `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit_v2&action=edit&isNew=1&type=77&createType=0&token=${token}&lang=zh_CN&timestamp=${Date.now()}`;
    return publishUrl;
}

export const weixinArticlePublisher = async (data) => {
    console.log('weixinArticlePublisher data', data);

    // const { contentData, processedData } = data;

    const contentData = data?.data;
    const processedData = data?.data;

    const platform = data?.platform;

    const metaInfo = platform?.metaInfo;

    const getFiletransferUrl = () => {
        const scene = '8';
        const token = metaInfo?.token;
        const username = metaInfo?.username;
        const ticket = metaInfo?.ticket;
        const timestamp = Math.floor(Date.now() / 1000);
        const url = `https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&scene=${scene}&writetype=doublewrite&groupid=1&ticket_id=${username}&ticket=${ticket}&svr_time=${timestamp}&token=${token}&lang=zh_CN&seq=${Date.now()}&t=${Math.random().toString()}`;
        return url;
    }

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
        title: 'textarea#title',
        editor: 'div.ProseMirror[contenteditable="true"]',
        imageUploadAdd: '.js_imagedialog',
        imageUpload: '.js_upload_btn_container input[type="file"]',
        imageNextButtons: '.weui-desktop-btn_primary',
        imagePickers: '.weui-desktop-img-picker__item',
        imageNextButtonText: '下一步',
        imageComfirmButtonText: '确认',
        submitButton: '#js_submit button',
        sendButton: '#js_send button',
        publishButtonText: '保存为草稿',
        confirmButtonText: '发表',
    }

    const fromRule = {
        title: {
            min: 2,
            max: 64,
        }
    }

    const autoUploadContentImage = async (contentData) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentData, 'text/html');
        const images = doc.getElementsByTagName('img');
        console.log('images', images);

        for (const image of images) {
            // 更新进度及状态
            console.log('image', image);
            const src = image.getAttribute('src');
            if (!src || !src.startsWith('http')) {
                continue;
            }
            const result = await uploadImage(src);
            if (!result) {
                continue;
            }
            image.setAttribute('src', result.url);
        }
        const content = doc.body.innerHTML;
        console.log('content', content);
        return content;
    }

    const autoFillContent = async (contentData) => {
        console.log('autoFillContent');
        const titleTextarea = document.querySelector(formElement.title);
        console.log('titleTextarea', titleTextarea);
        if (titleTextarea) {
            (titleTextarea as HTMLTextAreaElement).value = contentData?.title?.slice(0, fromRule.title.max) || '';
            titleTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            titleTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const editor = document.querySelector(formElement.editor) as HTMLElement;
        console.log('editor', editor);
        if (!editor) {
            console.log('未找到编辑器');
            return;
        }
        editor.focus();
        const editorPasteEvent = pasteEvent();

        // let content = contentData?.content
        let content = await autoUploadContentImage(contentData?.content);
        if (!content.startsWith('<') || !content.endsWith('>')) {
            content = `<div>${content}</div>`;
        }

        editorPasteEvent.clipboardData.setData('text/html', content);
        editor.dispatchEvent(editorPasteEvent);
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // const getFileName = (response) => {
    //     const disposition = response.headers.get('Content-Disposition');
    //     let filename = null;

    //     if (disposition && disposition.indexOf('attachment') !== -1) {
    //         const matches = /filename="([^;]+)"/.exec(disposition);
    //         if (matches != null && matches[1]) {
    //             filename = matches[1];
    //         }
    //     }
    //     return filename;
    // }

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

    // const autoUploadImage = async (url, fileName, blob) => {
    const autoUploadImage = async (imageData) => {
        let fileName = imageData.fileName;
        const url = imageData.src;

        if (!fileName) {
            fileName = getFileName(fileName, url);
        }

        const blob = new Blob([imageData.bits], { type: imageData.type });

        const fileType = blob.type;
        const fileSize = blob.size.toString();

        console.log('fileType', fileType);
        console.log('fileSize', fileSize);

        const formData = new FormData();
        formData.append('id', `p${Date.now()}`);
        formData.append('name', fileName);
        formData.append('type', fileType);
        formData.append('lastModifiedDate', new Date().toString());
        formData.append('size', fileSize);
        formData.append('file', blob, fileName);

        const filetransferUrl = getFiletransferUrl();
        console.log('filetransferUrl', filetransferUrl);
        const response = await fetch(filetransferUrl, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.info('autoUploadImage result', result);

        if (result.base_resp.ret !== 0) {
            throw new Error('图片上传失败');
        }

        return {
            url: result.cdn_url,
            mediaId: result.content,
            location: result.location,
            type: result.type
        };

    }

    const uploadImage = async (url) => {
        console.log('uploadImage url', url);
        if (!url) {
            return;
        }

        // const imageResponse = await fetch(url);

        // let fileName = getFileName(imageResponse);

        const imageResponse = await fetchImage(url);

        console.log('imageResponse', imageResponse);
        // console.log('imageResponse?.imageType', imageResponse?.imageType);

        // const imageData = imageResponse;//new Blob([imageResponse?.imageArrayBuffer], { type: imageResponse?.imageType });
        const result = await autoUploadImage(imageResponse);
        console.log('autoUploadImage result', result)
        return result;
    }

    const uploadImages = async (images) => {
        console.log('images', images);
        // const imageUpload = await observeElement(formElement.imageUpload);
        // if (!imageUpload) {
        //     throw new Error('未找到图片上传元素');
        // }

        const imageUpload = document.querySelector(formElement.imageUpload) as HTMLElement;
        if (!imageUpload) {
            throw new Error('未找到图片上传元素');
        }

        console.log('imageUpload', imageUpload);


        let files = [];

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

            files.push({
                url: url,
                name: fileName,
            });
        }

        if (dataTransfer.files.length === 0) {
            console.error('上传文件失败');
            return;
        }

        imageUpload.files = dataTransfer.files;
        imageUpload.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(2000);
        console.log('图片上传成功');

        return files;
    }

    const autoFillCover = async (cover) => {
        console.log('autoFillCover cover', cover);
        if (!cover) {
            return;
        }

        // const url = cover[0];
        // const result = await uploadImage(url);
        // console.log('uploadImage result', result);

        // if (!result) {
        //     throw new Error('封面图片上传失败');
        // }

        // const cropResult = await cropImage(result);
        // if (!cropResult) {
        //     throw new Error('封面图片裁剪失败');
        // }

        const imageUploadAdd = document.querySelector(formElement.imageUploadAdd) as HTMLElement;
        if (!imageUploadAdd) {
            return;
        }
        imageUploadAdd.click();
        await sleep(1000);

        const covers = [];

        console.log('cover', cover);
        for (const image of cover) {
            covers.push({
                url: image,
            });
        }

        console.log('covers', covers);
        const images = await uploadImages(covers);
        await sleep(5000);

        const image = images[0];

        const imagePickers = document.querySelectorAll(formElement.imagePickers);
        if (!imagePickers) {
            return;
        }

        const picker = Array.from(imagePickers).find(element => element.textContent?.includes(image.name));

        if (!picker) {
            return;
        }

        (picker as HTMLElement).click();
        await sleep(2000);

        const imageNextButtons = document.querySelectorAll(formElement.imageNextButtons);
        if (!imageNextButtons) {
            return;
        }

        const imageNextButton = Array.from(imageNextButtons).find(button => button.textContent?.includes(formElement.imageNextButtonText));
        if (!imageNextButton) {
            return;
        }
        (imageNextButton as HTMLElement).click();
        await sleep(2000);

        const nextButtons = document.querySelectorAll(formElement.imageNextButtons);
        if (!nextButtons) {
            return;
        }

        const comfirmButton = Array.from(nextButtons).find(button => button.textContent?.includes(formElement.imageComfirmButtonText));
        if (!comfirmButton) {
            return;
        }

        (comfirmButton as HTMLElement).click();
        await sleep(2000);

    };

    // const cropImage = async (imageData) => {
    //     const result = null;
    //     return result;
    // }

    const getPublishButton = () => {
        const submitButton = document.querySelector(formElement.submitButton);
        console.log('submitButton', submitButton);
        return submitButton;
    }

    const getConfirmPublishButton = () => {
        const sendButton = document.querySelector(formElement.sendButton);
        console.log('sendButton', sendButton);
        return sendButton;
    }

    const autoPublish = async () => {
        console.log('autoPublish');
        const publishButton = getPublishButton();
        if (!publishButton) {
            console.log(`未找到${formElement.publishButtonText}按钮`)
            return;
        }
        console.log('trrigle publish button click');
        publishButton.dispatchEvent(new Event('click', {
            bubbles: true,
            cancelable: true
        }));

        const confirmPlublishButton = await observeElement(getConfirmPublishButton);
        if (!confirmPlublishButton) {
            console.log(`未找到${formElement.confirmButtonText}按钮`)
            return;
        }
        confirmPlublishButton.dispatchEvent(new Event('click', {
            bubbles: true,
            cancelable: true
        }));
    }

    await observeElement(formElement.editor);
    await sleep(1000);

    await autoFillContent(processedData);
    await sleep(5000);

    if (processedData?.cover) {
        await autoFillCover(processedData.cover);
        await sleep(1000);
    }

    if (contentData.isAutoPublish) {
        await sleep(5000);
        autoPublish();
    }

}
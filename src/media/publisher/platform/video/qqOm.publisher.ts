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
export const qqOmVideoPublisher = async (data) => {
    console.log('qqOmVideoPublisher data', data);

    // const { contentData, processedData } = data;

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

          let checkElement  = null;
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
        videoUploadAdd: 'div.omui-panel button.omui-button--add',
        videoUpload: 'input[type="file"]',
        title: 'div.omui-articletitle span[data-placeholder="请输入标题（5-64个字）"]',
        // editor: 'div.ProseMirror[contenteditable="true"]',
        editor: 'div.omui-textarea textarea',
        coverDelete: '.article-cover-delete',
        imageUploadAdd: 'button.omui-button--add',
        imageUploadTabs: 'ul.omui-tab__nav li.omui-tab__label',
        imageUploadTabText: '本地上传',
        imageUpload: 'input[type="file"]',
        confirmUploadButton: 'div.omui-dialog-footer button.omui-button--primary',
        publishButtons: 'ul li button.omui-button',
        publishButtonText: '存草稿',
        timingPublishButtonText: '定时发布',
        // previewButtonText: '预览',
        confirmButtonText: '发布',
    }
    
    const fromRule = {
        title: {
            min: 5,
            max: 64,
        }
    }
    
    const autoFillContent = (contentData) => {
        console.log('autoFillContent');
        const titleTextarea = document.querySelector(formElement.title) as HTMLElement;
        console.log('titleTextarea', titleTextarea);
        if (titleTextarea) {
            const title = contentData?.title?.slice(0, fromRule.title.max) || '';

            titleTextarea.innerHTML = title;

            // titleTextarea.focus();
            // const editorPasteEvent = pasteEvent();
            // editorPasteEvent.clipboardData.setData('text/html', title);
            // titleTextarea.dispatchEvent(editorPasteEvent);
            // titleTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            // titleTextarea.dispatchEvent(new Event('change', { bubbles: true }));

            // (titleTextarea as HTMLTextAreaElement).value = contentData?.title?.slice(0, fromRule.title.max) || '';
            // titleTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            // titleTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const editor = document.querySelector(formElement.editor) as HTMLElement;
        console.log('editor', editor);
        if (!editor) {
            console.log('未找到编辑器');
            return;
        }
        editor.focus();

        editor.innerHTML = contentData?.description || contentData?.content;

        // const editorPasteEvent = pasteEvent();
        // editorPasteEvent.clipboardData.setData('text/html', contentData?.content);
        // editor.dispatchEvent(editorPasteEvent);
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
    };

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
        // const imageUpload = await observeElement(formElement.imageUpload);
        // if (!imageUpload) {
        //     throw new Error('未找到图片上传元素');
        // }

        const imageUpload = document.querySelector(formElement.imageUpload) as HTMLElement;
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
    
    const autoFillCover = async(cover) => {
        const clearDefaultCovers = async() => {
            const coverDeleteElements = document.querySelectorAll(formElement.coverDelete);
            if (!coverDeleteElements) {
                return;
            }
            console.log('coverDeleteElements length', coverDeleteElements.length);
            for (const coverDeleteElement of coverDeleteElements) {
                if (!coverDeleteElement) {
                    continue;
                }
                console.log('coverDelete trrigle click');
                (coverDeleteElement as HTMLElement).click();
            }
            await sleep(1000);
        };

        await clearDefaultCovers();

        const imageUploadAdd = document.querySelector(formElement.imageUploadAdd) as HTMLElement;
        if (!imageUploadAdd) {
            return;
        }

        imageUploadAdd.click();
        await sleep(1000);

        const imageUploadTabs = document.querySelectorAll(formElement.imageUploadTabs);
        const imageUploadTab = Array.from(imageUploadTabs).find(tab => tab.textContent?.includes(formElement.imageUploadTabText));
        if (!imageUploadTab) {
            return;
        }
        (imageUploadTab as HTMLElement).click();
        await sleep(1000);

        const images = [];

        console.log('cover', cover);
        for (const image of cover) {
            images.push({
                url: image,
            });
        }

        console.log('images', images);
        await uploadImages(images);
        await sleep(2000);

        const confirmUploadButton = document.querySelector(formElement.confirmUploadButton);
        if (!confirmUploadButton) {
            return;
        }

        confirmUploadButton.dispatchEvent(new Event('click', { bubbles: true }));
        await sleep(2000);
    };

    const autoUploadVideo = async(videoData) => {
        console.log('videoData', videoData);

        const videoUploadAdd = document.querySelector(formElement.videoUploadAdd) as HTMLElement;
        if (!videoUploadAdd) {
            return;
        }

        videoUploadAdd.click();
        await sleep(1000);

        const videoUpload = (await observeElement(formElement.videoUpload)) as HTMLElement;
        if (!videoUpload) {
            throw new Error('未找到视频上传元素');
        }

        console.log('videoUpload', videoUpload);

        // const blob = new Blob([videoData.videoBuffer], { type: videoData.type });

        const response = await fetch(videoData.objectUrl);
        const blob = await response.blob();

        const file = new File([blob], videoData.name, { type: videoData.type });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        videoUpload.files = dataTransfer.files;
        videoUpload.dispatchEvent(new Event('input', { bubbles: true }));
        videoUpload.dispatchEvent(new Event('change', { bubbles: true }));

        console.log('视频上传事件已发送');

        await sleep(2000);
    }
    
    const getPublishButton = () => {
        const buttons = document.querySelectorAll(formElement.publishButtons);
        const publishButton = Array.from(buttons)?.find((button) => button.textContent?.includes(formElement.publishButtonText));
        console.log('publishButton', publishButton);
        return publishButton;
    }

    const getConfirmPublishButton = () => {
        const buttons = document.querySelectorAll(formElement.publishButtons);
        const confirmPublishButton = Array.from(buttons)?.find((button) => button.textContent?.includes(formElement.confirmButtonText));
        console.log('confirmPublishButton', confirmPublishButton);
        return confirmPublishButton;
    }
    
    const autoPublish = async() => {
        console.log('autoPublish');
        // const publishButton = getPublishButton();
        // if (!publishButton) {
        //     console.log(`未找到${formElement.publishButtonText}按钮`)
        //     return;
        // }
        // console.log('trrigle publish button click');
        // publishButton.dispatchEvent(new Event('click', {
        //     bubbles: true,
        //     cancelable: true
        // }));
        
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

    await observeElement(formElement.videoUpload);
    await sleep(1000);

    await autoUploadVideo(processedData.videoData);
    await sleep(1000);

    autoFillContent(processedData);
    await sleep(5000);

    if (processedData?.cover) {
        // autoFillCover(processedData.cover);
    }

    if (contentData.isAutoPublish) {
        await sleep(5000);
        autoPublish();
    }

}


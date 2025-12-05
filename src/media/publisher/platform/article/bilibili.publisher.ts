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
export const bilibiliArticlePublisher = async (data) => {
    console.log('bilibiliArticlePublisher data', data);

    // const { contentData, processedData } = data;

    const contentData = data?.data;
    const processedData = data?.data;

    let editorDocument = null;

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
            checkElement = () => (editorDocument || document).querySelector(selector);
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
          observer.observe((editorDocument || document).body, {
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
        editorIframe: '#edit-article-box iframe',
        title: 'div.bre-title-input textarea',
        editor: 'div[contenteditable="true"]',
        imageUpload: 'div.bre-settings__coverbox__img__icon',
        imagePickerButtons: 'div.bre-modal button.bre-btn',
        imagePickerConfirmText: '确认',
        publishButtons: 'div.b-read-editor__btns button.bre-btn',
        saveDraftButtonText: '存草稿',
        confirmButtonText: '提交文章',
    }
    
    const fromRule = {
        title: {
            min: 2,
            max: 30,
        }
    }

    const getEditorIframe = () => {
        return document.querySelector(formElement.editorIframe);
    }

    const getEditorDocument = () => {
        const editorIframe = getEditorIframe();
        return editorIframe.contentWindow.document;
    }
    
    const autoFillContent = (contentData) => {
        console.log('autoFillContent');
        const titleTextarea = editorDocument.querySelector(formElement.title);
        console.log('titleTextarea', titleTextarea);
        if (titleTextarea) {
            (titleTextarea as HTMLTextAreaElement).value = contentData?.title?.slice(0, fromRule.title.max) || '';
            titleTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            titleTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const editor = editorDocument.querySelector(formElement.editor)  as HTMLElement;
        console.log('editor', editor);
        if (!editor) {
            console.log('未找到编辑器');
            return;
        }
        editor.focus();

        const content = contentData?.content;

        if (editor.contentEditable === 'true') {
            editor.innerHTML = content;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));
            return;
        }

        const editorPasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: new DataTransfer(),
        });
        editorPasteEvent.clipboardData.setData('text/html', content);
        editor.dispatchEvent(editorPasteEvent);
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

        const imageUpload = editorDocument.querySelector(formElement.imageUpload) as HTMLElement;
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
    };
    
    const getSaveDraftButton = () => {
        const buttons = editorDocument.querySelectorAll(formElement.publishButtons);
        const saveDraftButton = Array.from(buttons)?.find((button) => button.textContent?.includes(formElement.saveDraftButtonText));
        console.log('saveDraftButton', saveDraftButton);
        return saveDraftButton;
    }

    const getConfirmPublishButton = () => {
        const buttons = editorDocument.querySelectorAll(formElement.publishButtons);
        const confirmPublishButton = Array.from(buttons)?.find((button) => button.textContent?.includes(formElement.confirmButtonText));
        console.log('confirmPublishButton', confirmPublishButton);
        return confirmPublishButton;
    }

    const autoSaveDraft = async() => {
        console.log('autoSaveDraft');
        const saveDraftButton = getSaveDraftButton();
        if (!saveDraftButton) {
            console.log(`未找到${formElement.saveDraftButtonText}按钮`)
            return;
        }
        console.log('trrigle publish button click');
        saveDraftButton.dispatchEvent(new Event('click', {
            bubbles: true,
            cancelable: true
        }));
    }
    
    const autoPublish = async() => {
        console.log('autoPublish');
        
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

    await observeElement(formElement.editorIframe);
    await sleep(1000);

    editorDocument = getEditorDocument();

    autoFillContent(processedData);
    await sleep(5000);

    // if (processedData?.cover) {
    //     autoFillCover(processedData.cover);
    // }

    if (contentData.isAutoPublish) {
        await sleep(5000);
        autoPublish();
    } else {
        // autoSaveDraft();
    }

}


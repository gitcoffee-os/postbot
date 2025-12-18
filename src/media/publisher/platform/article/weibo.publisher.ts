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
export const weiboArticlePublisher = async (data) => {
    console.log('weiboArticlePublisher data', data);

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
        title: 'textarea[placeholder="请输入标题"]',
        editor: 'div[contenteditable="true"]',
        contentButtons: 'span.n-button__content',
        writeAticleButtonText: '写文章',
        coverDelete: '.article-cover-delete',
        // imageUploadAdd: 'div.cover-preview',
        imageUploadAdd: 'div.cover-empty',
        imageUploadTabs: 'div.n-tabs-tab[data-name="album"]',
        imageUploadTabText: '图片库',
        imageUpload: 'input[type="file"]',
        imagePickers: 'div.image-item img',
        imageNextButtons: 'div.n-dialog__content button.n-button',
        imageNextButtonText: '下一步',
        imageComfirmButtonText: '确定',
        publishButtons: 'div.footer-item button.n-button',
        saveDraftButtonText: ' 保存草稿',
        confirmButtonText: '下一步',
    }
    
    const fromRule = {
        title: {
            min: 2,
            max: 30,
        }
    }
    
    const autoFillContent = (contentData) => {
        console.log('autoFillContent');
        const titleTextarea = document.querySelector(formElement.title);
        console.log('titleTextarea', titleTextarea);
        if (titleTextarea) {
            (titleTextarea as HTMLTextAreaElement).value = contentData?.title?.slice(0, fromRule.title.max) || '';
            titleTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            titleTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const editor = document.querySelector(formElement.editor)  as HTMLElement;
        console.log('editor', editor);
        if (!editor) {
            console.log('未找到编辑器');
            return;
        }
        editor.focus();
        const editorPasteEvent = pasteEvent();
        editorPasteEvent.clipboardData.setData('text/html', contentData?.content);
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

        const imageUpload = document.querySelector(formElement.imageUpload) as HTMLElement;
        if (!imageUpload) {
            throw new Error('未找到图片上传元素');
        }

        console.log('imageUpload', imageUpload);

        const dataTransfer = new DataTransfer();

        for (const image of images) {
            if (image.objectUrl) {
                const response = await fetch(image.objectUrl);
                const blob = await response.blob();
    
                const file = new File([blob], image.name, { type: image.type });
                dataTransfer.items.add(file);
            } else {
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

    const getPickerImage = () => {
        const imagePickers = document.querySelectorAll(formElement.imagePickers);
        if (!imagePickers) {
            return;
        }

        const picker = imagePickers[0]; 
        if (picker && picker?.src.indexOf('https://') === 0) {
            return picker;
        }
        return null;
    }
    
    const autoFillCover = async(cover) => {
        // const clearDefaultCovers = async() => {
        //     const coverDeleteElements = document.querySelectorAll(formElement.coverDelete);
        //     if (!coverDeleteElements) {
        //         return;
        //     }
        //     console.log('coverDeleteElements length', coverDeleteElements.length);
        //     for (const coverDeleteElement of coverDeleteElements) {
        //         if (!coverDeleteElement) {
        //             continue;
        //         }
        //         console.log('coverDelete trrigle click');
        //         (coverDeleteElement as HTMLElement).click();
        //     }
        //     await sleep(1000);
        // };

        // await clearDefaultCovers();

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

        const covers = [];
        let imageName = null;

        console.log('cover', cover);
        for (const image of cover) {
            if (image instanceof Object) {
                covers.push(image);
            } else {
                covers.push({
                    url: image,
                });
            }
        }

        console.log('covers', covers);
        await uploadImages(covers);
        await sleep(2000);

        const picker = await observeElement(getPickerImage, 100000);
        if (!picker) {
            return;
        }

        await sleep(2000);
        (picker as HTMLElement).parentElement.click();
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
    
    const getSaveDraftButton = () => {
        const buttons = document.querySelectorAll(formElement.publishButtons);
        const saveDraftButton = Array.from(buttons)?.find((button) => button.textContent?.includes(formElement.saveDraftButtonText));
        console.log('saveDraftButton', saveDraftButton);
        return saveDraftButton;
    }

    const getConfirmPublishButton = () => {
        const buttons = document.querySelectorAll(formElement.publishButtons);
        const confirmPublishButton = Array.from(buttons)?.find((button) => button.textContent?.includes(formElement.confirmButtonText));
        console.log('confirmPublishButton', confirmPublishButton);
        return confirmPublishButton;
    }

    const getWriteArticleButton = () => {
        const buttons = document.querySelectorAll(formElement.contentButtons);
        const writeAticlePublishButton = Array.from(buttons)?.find((button) => button.textContent?.includes(formElement.writeAticleButtonText));
        console.log('writeAticlePublishButton', writeAticlePublishButton);
        return writeAticlePublishButton;
    } 

    const autoOpenWriteAricle = async() => {
        const writeArticleButton = await observeElement(getWriteArticleButton);
        
        writeArticleButton.dispatchEvent(new Event('click', {
            bubbles: true,
            cancelable: true
        }));
    }

    const autoSaveDraf = async() => {
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

    await autoOpenWriteAricle();
    await sleep(5000);

    const editor = await observeElement(formElement.editor);
    if (editor?.value) {
        console.log('当前草稿不是新草稿');
        return;
    }
    await sleep(1000);

    autoFillContent(processedData);
    await sleep(5000);

    if (processedData?.cover) {
        await autoFillCover(processedData.cover);
    }

    if (contentData.isAutoPublish) {
        await sleep(5000);
        autoPublish();
    } else {
        autoSaveDraf();
    }

}


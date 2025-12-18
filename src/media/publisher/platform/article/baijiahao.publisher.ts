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
export const baijiahaoArticlePublisher = async (data) => {
    console.log('baijiahaoArticlePublisher data', data);

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
        title: 'div.input-box textarea',
        editorIframe: 'div.edui-editor iframe',
        editor: '.news-editor-pc',
        imageAddButtons: 'label.cheetah-radio-wrapper',
        imageAdd1: '单图',
        imageAdd3: '三图',
        // coverDelete: '.op-remove',
        imageUploadAdd: 'div.coverUploaderView div.container',
        imageUploadTabs: 'div.cheetah-tabs-tab',
        imageUploadTabText: '本地图片',
        imageUpload: 'div.choose-cover-local-upload input[type="file"]',
        confirmUploadButton: 'div.cheetah-modal-footer button.cheetah-btn-primary',
        publishButtons: 'div.editor-component-operator button.cheetah-btn',
        saveDraftButtonText: '存草稿',
        previewButtonText: '预览',
        timingButtonText: '定时发布',
        confirmButtonText: '发布',
    }
    
    const fromRule = {
        title: {
            min: 2,
            max: 30,
        }
    }
    
    const autoFillContent = async(contentData) => {
        console.log('autoFillContent');
        const titleTextarea = document.querySelector(formElement.title);
        console.log('titleTextarea', titleTextarea);
        if (titleTextarea) {
            (titleTextarea as HTMLTextAreaElement).value = contentData?.title?.slice(0, fromRule.title.max) || '';
            titleTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            titleTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const editorIframe = document.querySelector(formElement.editorIframe);
        if (!editorIframe || !editorIframe.contentWindow) {
            console.log('未找到编辑器 IFrame');
            return;
        }

        const editor = editorIframe.contentWindow.document.querySelector(formElement.editor)  as HTMLElement;
        console.log('editor', editor);
        if (!editor) {
            console.log('未找到编辑器');
            return;
        }

        // await sleep(5000);

        const iframeDocument = editorIframe.contentWindow.document;

        function clearEditorContent(editorElement) {
            try {
                // 聚焦编辑器（确保可以操作）
                editorElement.focus();
                
                // 创建范围选择所有内容
                const range = document.createRange();
                range.selectNodeContents(editorElement);
                
                // 获取选择对象并应用范围
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                
                // 删除选中的内容
                // 使用现代方法：
                range.deleteContents();
                
                // 清除选择
                selection.removeAllRanges();
                
            } catch (error) {
                console.error('清空编辑器内容失败:', error);
                
                // 降级方案：直接清空innerHTML
                editorElement.innerHTML = '';
            }
        }

        clearEditorContent(editor);

        const content = contentData?.content;
        
        // 聚焦编辑器
        editor.focus();

        // 插入新内容
        if (iframeDocument.execCommand('insertHTML', false, content)) {
            console.log('内容插入成功');
        } else {
            // 降级到DOM操作
            editor.innerHTML = content;
        }

        // 触发事件
        const inputEvent = new Event('input', { bubbles: true });
        editor.dispatchEvent(inputEvent);

        // editor.focus();

        // const editorPasteEvent = new ClipboardEvent('paste', {
        //     bubbles: true,
        //     cancelable: true,
        //     clipboardData: new DataTransfer(),
        // })
        // console.log('contentData?.content', contentData?.content);
        // editorPasteEvent.clipboardData.setData('text/html', contentData?.content);
        // editor.dispatchEvent(editorPasteEvent);
        // editor.dispatchEvent(new Event('input', { bubbles: true }));
        // // editor.dispatchEvent(new Event('change', { bubbles: true }));

        // const events = ['input', 'change', 'blur', 'focus'];
    
        // events.forEach(eventType => {
        //     const event = new Event(eventType, { bubbles: true });
        //     editor.dispatchEvent(event);
        // });
        
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

        const imageAddButtons = document.querySelectorAll(formElement.imageAddButtons);
        // 默认单图
        const imageAdd1 = Array.from(imageAddButtons).find(button => button.textContent?.includes(formElement.imageAdd1));
        if (!imageAdd1) {
            console.log(`未找到${formElement.imageAdd1}按钮`);
            return;
        }
        (imageAdd1 as HTMLElement).click();

        const getImageUploadAdd = () => {
            return document.querySelector(formElement.imageUploadAdd) as HTMLElement;
        }

        const imageUploadAdd = await observeElement(getImageUploadAdd);
        if (!imageUploadAdd) {
            console.log('未找到封面上传按钮');
            return;
        }

        imageUploadAdd.click();
        await sleep(1000);

        const imageUploadTabs = document.querySelectorAll(formElement.imageUploadTabs);
        const imageUploadTab = Array.from(imageUploadTabs).find(tab => tab.textContent?.includes(formElement.imageUploadTabText));
        if (!imageUploadTab) {
            console.log(`未找到${formElement.imageUploadTabText}按钮`);
            return;
        }
        (imageUploadTab as HTMLElement).click();
        await sleep(1000);

        const covers = [];

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

        const confirmUploadButton = document.querySelector(formElement.confirmUploadButton);
        if (!confirmUploadButton) {
            return;
        }

        confirmUploadButton.dispatchEvent(new Event('click', { bubbles: true }));
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

    const autoSaveDraf = async() => {
        console.log('autoSaveDraf');
        const saveDraftButton = getSaveDraftButton();
        if (!saveDraftButton) {
            console.log(`未找到${formElement.saveDraftButtonText}按钮`)
            return;
        }
        console.log('trrigle save draft button click');
        saveDraftButton.dispatchEvent(new Event('click', {
            bubbles: true,
            cancelable: true
        }));
    }
    
    const autoPublish = async() => {
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

    await autoFillContent(processedData);
    await sleep(5000);

    if (processedData?.cover) {
       await autoFillCover(processedData.cover);
    }

    await autoSaveDraf();
    
    if (contentData.isAutoPublish) {
        await sleep(5000);
        autoPublish();
    }

}


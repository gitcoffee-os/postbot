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

export const cnblogsArticlePublisher = async (data) => {
    console.log('cnblogsArticlePublisher data', data);

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
        title: '#post-title',
        editor: '#md-editor',
        submitButtons: 'button.cnb-button',
        submitButtonText: '发布',
    }

    const fromRule = {
        title: {
            min: 2,
            max: 100,
        }
    }

    const autoFillContent = async (contentData) => {
        console.log('autoFillContent');
        const titleInput = await observeElement(formElement.title) as HTMLElement;
        console.log('titleInput', titleInput);
        if (!titleInput) {
            console.log('未找到标题输入框');
            return;
        }
        (titleInput as HTMLTextAreaElement).value = contentData?.title?.slice(0, fromRule.title.max) || '';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(1000);

        const editor = (await observeElement(formElement.editor)) as HTMLElement;
        console.log('editor', editor);
        if (!editor) {
            console.log('未找到编辑器');
            return;
        }
        editor.focus();
        
        (editor as HTMLTextAreaElement).value = contentData?.content;

        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
        
        // const editorPasteEvent = pasteEvent();
        // editorPasteEvent.clipboardData.setData('text/html', contentData?.content);
        // editor.dispatchEvent(editorPasteEvent);
        // editor.dispatchEvent(new Event('input', { bubbles: true }));
        // editor.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const autoPublish = () => {
        const submitButtons = document.querySelectorAll(formElement.submitButtons);
        console.log('submitButtons', submitButtons);
        if (!submitButtons) {
            return;
        }
        const submitButton = Array.from(submitButtons).find(button => button.textContent?.includes(formElement.submitButtonText));
        console.log('submitButton', submitButton);
        if (!submitButton) {
            return;
        }
        (submitButton as HTMLElement).click();
    }

    await autoFillContent(contentData);
    await sleep(5000);

    if (contentData.isAutoPublish) {
        autoPublish();
    }

}
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
import type { PlasmoCSConfig } from "plasmo"

import { initCopyEvent } from "~events/copy.event"

import { getReaderData } from "~media/parser"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

import { createApp } from 'vue'
import PostbotModal from './components/PostbotModal';
import { handleMessage } from "./services/message.services";
import { setupI18n } from '~locales';
import { processContent } from '@gitcoffee/postbot-content-adapter';
import { debounce as debounceUtils } from '@gitcoffee/postbot-utils';
import antDesignCss from 'data-text:ant-design-vue/dist/reset.css'
import globalCss from 'data-text:../styles/global.css'

const initApp = async () => {
  const host = document.createElement('div');
  host.id = 'postbot-host';
  host.style.cssText = 'position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: visible; z-index: 2147483647;';

  const shadowRoot = host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = antDesignCss + '\n' + globalCss;
  shadowRoot.appendChild(styleEl);

  const container = document.createElement('div');
  container.id = 'postbot-container';
  shadowRoot.appendChild(container);

  document.body.appendChild(host);

  const app = createApp(PostbotModal);

  app.provide('postbot-shadow-root', shadowRoot);
  app.provide('postbot-shadow-container', container);

  await setupI18n(app, 'zh');

  app.mount(container);
}

initApp();

let data = {
  content: '',
  contentImages: [],
}

window.addEventListener("load", () => {
  console.log(
    "You may find that having is not so pleasing a thing as wanting. This is not logical, but it is often true."
  )

  // initCopyEvent();

  const data = getReaderData();
  const { content, contentImages } = data;

  chrome.runtime.sendMessage({
    type: "IMAGE_DETECTED",
    contentImages: Array.from(contentImages).map(img => ({ src: img.src })),
  })

  chrome.runtime.sendMessage({
    type: "CONTENT_DETECTED",
    content: content,
  });

  // document.body.style.background = "pink"
})

const handleSelectionChange = debounceUtils.debounce(() => {
  const selection = window.getSelection();

  const hasSelection = selection && selection.rangeCount > 0 && selection.toString().trim().length > 0;

  const selectionData: { selectionContent: string; selectionImages: { src: string }[] } = {
    selectionContent: '',
    selectionImages: [],
  };

  if (hasSelection) {
    try {
      const range = selection!.getRangeAt(0);
      const selectedHTML = range.cloneContents();
      const serializer = new XMLSerializer();
      const htmlContent = serializer.serializeToString(selectedHTML);
      const processedHtml = processContent(htmlContent);

      selectionData.selectionContent = processedHtml;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = processedHtml;
      const imgElements = tempDiv.querySelectorAll('img');
      const selectedImages = Array.from(imgElements)
        .filter((img) => img.src && !img.src.startsWith('chrome-extension://'))
        .map((img) => ({ src: img.src }));
      selectionData.selectionImages = selectedImages;
    } catch (error) {
      console.error('Error with range operations:', error);
    }
  }

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: "SELECTION_DATA",
      ...selectionData,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      hasSelection: hasSelection,
    });
  }
}, 300);

document.addEventListener("selectionchange", () => {
  // console.log("selectionchange 触发", window.getSelection()?.toString());
  // 调用选区变化处理函数
  handleSelectionChange();
});

// 发送获取到的图片URL到后台脚本

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('addListener request.action', request.action);

  handleMessage(request, sender, sendResponse);

  return true;
});

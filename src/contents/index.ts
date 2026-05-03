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
import 'ant-design-vue/dist/reset.css';

import { handleMessage } from "./services/message.services";
import { setupI18n } from '~locales';
import { processContent } from '@gitcoffee/postbot-content-adapter';

const initApp = async () => {
  const app = createApp(PostbotModal)

  await setupI18n(app);

  const container = document.createElement('div')
  container.id = 'postbot-container'
  document.body.appendChild(container)

  app.mount(container)
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

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 选区变化处理函数
const handleSelectionChange = debounce(() => {
  const selection = window.getSelection();
  
  // 检查是否有选中内容
  const hasSelection = selection && selection.rangeCount > 0 && selection.toString().trim().length > 0;
  
  const selectionData = {
    selectionContent: '',
    selectionImages: []
  };
  
  if (hasSelection) {
    try {
      const range = selection.getRangeAt(0);
      const selectedHTML = range.cloneContents();
      const serializer = new XMLSerializer();
      const htmlContent = serializer.serializeToString(selectedHTML);
      const processedHtml = processContent(htmlContent);

      selectionData.selectionContent = processedHtml;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = processedHtml;
      const imgElements = tempDiv.querySelectorAll('img');
      const selectedImages = Array.from(imgElements)
        .filter(img => img.src && !img.src.startsWith('chrome-extension://'))
        .map(img => ({ src: img.src }));
      selectionData.selectionImages = selectedImages;
    } catch (error) {
      console.error('Error with range operations:', error);
    }
  }
  
  // 发送选区数据到background script
  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: "SELECTION_DATA",
      ...selectionData,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      hasSelection: hasSelection
    });
  }
}, 300); // 300ms 防抖

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

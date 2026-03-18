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
import { initPostBot } from "~api"

// 初始化插件系统
import "~plugins";

import { initEvents } from "~events";

import { handleMessage } from "./message.background";

export const config: PlasmoCSConfig = {
  // matches: ["https://www.plasmo.com/*"]
}

console.log(
  "Live now; make now always the most precious time. Now will never come again."
)

initPostBot();

initEvents();

console.log('PostBot chrome.runtime.onMessage.addListener');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('request', request);
  console.log('addListener request.action', request.action);

  if (request.type === 'request') {
    handleMessage(request, sender, sendResponse);
  } else if (request.type === 'SELECTION_CHANGED' || 
             request.type === 'SELECTION_DATA' ||
             request.type === 'TEST_SELECTION_DATA' ||
             request.type === 'IMAGE_DETECTED' || 
             request.type === 'CONTENT_DETECTED' ||
             request.type === 'TEST_MESSAGE') {
    // 转发消息到所有扩展组件（包括sidebar）
    chrome.runtime.sendMessage(request, (response) => {
      if (chrome.runtime.lastError) {
        // 即使有错误也要继续，可能是因为没有接收者
      }
    });
    
    // 立即响应，避免Content Script等待
    sendResponse({ status: 'forwarded', message: 'Message forwarded successfully' });
  } else if (request.action === 'getContent' || 
             request.action === 'getImages' || 
             request.action === 'getSelectionContent') {
    // 转发content script相关的请求到content script
    // 使用tabs.sendMessage发送到当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ error: 'No active tab found' });
      }
    });
    // 必须返回true以表示异步响应
    return true;
  }

  return true;
});

export { }

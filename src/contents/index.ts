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
  // matches: ["https://www.plasmo.com/*"]
}

import { createApp } from 'vue'
import PostbotModal from './components/PostbotModal';
import 'ant-design-vue/dist/reset.css';

import { handleMessage } from "./services/message.services";

// 创建并挂载 Vue 应用到页面
const app = createApp(PostbotModal)

// 创建一个容器 div，并添加到页面 body 中
const container = document.createElement('div')
container.id = 'postbot-container'
document.body.appendChild(container)

// 将 Vue 应用挂载到刚创建的 div 上
app.mount(container)

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

// 发送获取到的图片URL到后台脚本

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('addListener request.action', request.action);

  handleMessage(request, sender, sendResponse);

  return true;
});
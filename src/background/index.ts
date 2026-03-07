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
  }

  return true;
});

export { }

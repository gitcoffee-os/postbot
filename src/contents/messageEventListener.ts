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
import { POSTBOT_ACTION } from "~message/postbot.action";
// import { getMetaInfoList } from "~media/meta";

window.addEventListener('message', async (event) => {
  const request = event.data;
  console.log('addEventListener', request);
  console.log('event.origin', event.origin);
  if (request?.type === 'response') {
    return;
  }
  if (!request?.action) {
    return;
  }
  // 验证消息来源是否可信
  // 转发消息
  dispatchSendMessage(request, event);
});

const dispatchSendMessage = (request, event) => {
  console.log('dispatchSendMessage', request);

  switch (request.action) {
    // case POSTBOT_ACTION.META_INFO_LIST:
    //     const metaInfoList = getMetaInfoList();
    //     event.source.postMessage(successResponse(request, metaInfoList));
    //     break;
    default:
      chrome.runtime.sendMessage(request).then((response) => {
        console.log('dispatchSendMessage response', response);
        event.source.postMessage(successResponse(request, response));
      });
      break;
  }
}

const successResponse = (request, data) => {
  return {
    type: 'response',
    traceId: request.traceId,
    action: request.action,
    code: 0,
    message: 'success',
    data,
  };
}

// const errorResponse = (request, data) => {
//   return {
//     type: 'response',
//     traceId: request.traceId,
//     action: request.action,
//     code: 403,
//     message: 'Untrusted origin',
//     data: null,
//   };
// }
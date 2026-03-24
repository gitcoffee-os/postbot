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
import { getReaderData } from "~media/parser";

import { state } from "../components/postbot.data";

import { getPostBotBaseUrl } from '~config/config';

import { handleMetaMessage } from "./meta.services";
import { handleMediaMessage, handleMediaSyncMessage } from "./media.services";

export const handleMessage = (request, sender, sendResponse) => {
    const data = getReaderData();
    const { content } = data;

    let message = {};
    let userInfo = {};
    switch (request.action) {
        case 'doLogin':
            window.open(`${getPostBotBaseUrl()}/exmay/postbot/media/publish`, '_blank');
            sendResponse({});
            break;
        case 'getContent':
            message = { content: content || '' };
            sendResponse(message);
            break;
        case 'getSelectionContent':
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                
                // 克隆两次，一次用于获取HTML内容，一次用于提取图片
                const selectedHTMLForContent = range.cloneContents();
                
                // 获取HTML内容
                const serializer = new XMLSerializer();
                const htmlContent = serializer.serializeToString(selectedHTMLForContent);
                
                message = { 
                    selectionContent: htmlContent
                };
            } else {
                message = { 
                    selectionContent: ''
                };
            }
            sendResponse(message);
            break;
        case 'previewContent':
            message = { content: content };
            // pageContent('test');
            state.rangType = 'content';
            state.isModalVisible = true;
            sendResponse(message);
            break;
        case 'selectionContent':
            message = { content: content };
            // pageContent('test');
            state.rangType = 'selection';
            state.isModalVisible = true;
            sendResponse(message);
            break;
        case 'setFlowButton':
            state.showFlowButton = request?.showFlowButton;
            sendResponse({});
            break;
        // 媒体相关的消息处理
        case 'getImages':
        case 'getAllImages':
        case 'getSelectionImages':
            handleMediaMessage(request, sender, sendResponse);
            break;
        // 媒体同步相关的消息处理
        case 'MEDIA_SYNC.GET_SYNC_IMAGES':
        case 'MEDIA_SYNC.UPLOAD_COMPLETE':
            handleMediaSyncMessage(request, sender, sendResponse);
            break;
        default:
            handleMetaMessage(request, sender, sendResponse);
            break;
    }
}

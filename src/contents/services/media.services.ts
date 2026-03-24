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
import { getImgElements } from "~media/handler/image.handler";
import { markUploadComplete, getUploadQueueImages } from "~utils/media";

const MEDIA_SYNC_ACTION = {
  GET_SYNC_IMAGES: 'MEDIA_SYNC.GET_SYNC_IMAGES',
  SYNC_IMAGES_RESPONSE: 'MEDIA_SYNC.SYNC_IMAGES_RESPONSE',
  UPLOAD_COMPLETE: 'MEDIA_SYNC.UPLOAD_COMPLETE',
};

/**
 * 验证消息来源是否可信
 */
const isValidOrigin = (origin: string): boolean => {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.exmay.com');
  } catch {
    return false;
  }
};

/**
 * 处理获取同步图片请求
 */
export const handleGetSyncImages = async (request, event) => {
  // 验证消息来源
  if (!isValidOrigin(event.origin)) {
    console.warn('[MediaSync] Untrusted origin:', event.origin);
    return;
  }
  
  const syncId = request.data?.syncId;
  console.log('[MediaSync] GET_SYNC_IMAGES request, syncId:', syncId);
  
  if (!syncId) {
    console.warn('[MediaSync] No syncId provided');
    event.source.postMessage({
      type: 'response',
      traceId: request.traceId,
      action: request.action,
      code: 400,
      message: 'No syncId provided',
      data: null
    });
    return;
  }
  
  const queueImages = getUploadQueueImages(syncId);
  
  if (queueImages && queueImages.length > 0) {
    console.log('[MediaSync] Found', queueImages.length, 'images in queue');
    
    const validImages = queueImages.filter(img => img.data);
    console.log('[MediaSync] Returning', validImages.length, 'valid images with base64 data');
    
    event.source.postMessage({
      type: 'response',
      traceId: request.traceId,
      action: request.action,
      code: 0,
      message: 'success',
      data: {
        images: validImages,
        syncId: syncId
      }
    });
    return;
  }
  
  chrome.storage.local.get(syncId, (result) => {
    const images = result[syncId] || [];
    console.log('[MediaSync] Found', images.length, 'images in storage');
    
    event.source.postMessage({
      type: 'response',
      traceId: request.traceId,
      action: request.action,
      code: 0,
      message: 'success',
      data: {
        images: images,
        syncId: syncId
      }
    });
  });
}

/**
 * 处理上传完成通知
 */
export const handleUploadComplete = async (request, event) => {
  // 验证消息来源
  if (!isValidOrigin(event.origin)) {
    console.warn('[MediaSync] Untrusted origin:', event.origin);
    return;
  }
  
  const syncId = request.data?.syncId;
  const success = request.data?.success;
  
  console.log('[MediaSync] UPLOAD_COMPLETE, syncId:', syncId, 'success:', success);
  
  if (!syncId) {
    console.warn('[MediaSync] No syncId provided');
    return;
  }
  
  await markUploadComplete(syncId, success);
  
  event.source.postMessage({
    type: 'response',
    traceId: request.traceId,
    action: request.action,
    code: 0,
    message: 'success',
    data: {
      syncId: syncId,
      cleaned: true
    }
  });
}

/**
 * 处理媒体消息
 */
export const handleMediaMessage = (request, sender, sendResponse) => {
  const data = getReaderData();
  const { contentImages } = data;

  let message = {};

  switch (request.action) {
    case 'getImages':
      message = { contentImages: contentImages || [] };
      sendResponse(message);
      break;
    case 'getAllImages':
      const allImages = getImgElements(document);
      message = { allImages: allImages || [] };
      sendResponse(message);
      break;
    case 'getSelectionImages':
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedHTML = range.cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(selectedHTML);
        const imgElements = tempDiv.querySelectorAll('img');
        const selectedImages = Array.from(imgElements).map(img => ({
          src: img.src,
          alt: img.alt || '',
          title: img.title || ''
        }));
        message = { selectionImages: selectedImages };
      } else {
        message = { selectionImages: [] };
      }
      sendResponse(message);
      break;
    default:
      sendResponse({ error: 'Unknown media action' });
      break;
  }
};

/**
 * 处理媒体同步消息（供 message.services.ts 调用）
 */
export const handleMediaSyncMessage = (request, sender, sendResponse) => {
  switch (request.action) {
    case 'MEDIA_SYNC.GET_SYNC_IMAGES':
      // 构造一个模拟的 event 对象，用于调用 handleGetSyncImages
      const getSyncImagesEvent = {
        origin: sender.origin || '',
        source: {
          postMessage: (message) => {
            sendResponse(message.data);
          }
        }
      };
      handleGetSyncImages(request, getSyncImagesEvent);
      return true; // 保持消息通道开启，等待异步响应
      
    case 'MEDIA_SYNC.UPLOAD_COMPLETE':
      // 构造一个模拟的 event 对象，用于调用 handleUploadComplete
      const uploadCompleteEvent = {
        origin: sender.origin || '',
        source: {
          postMessage: (message) => {
            sendResponse(message.data);
          }
        }
      };
      handleUploadComplete(request, uploadCompleteEvent);
      return true; // 保持消息通道开启，等待异步响应
      
    default:
      sendResponse({ error: 'Unknown media sync action' });
      break;
  }
};

/**
 * 获取媒体同步 Action 常量
 */
export const getMediaSyncAction = () => MEDIA_SYNC_ACTION;

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
import { getPostBotBaseUrl } from "~config/config";

export interface ImageData {
  src: string;
  alt?: string;
  title?: string;
}

export interface ProcessedImage {
  name: string;
  data: string;
  type: string;
  size: number;
}

export interface UploadQueueItem {
  syncId: string;
  images: ProcessedImage[];
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}

export const MEDIA_SYNC_ACTION = {
  GET_SYNC_IMAGES: 'MEDIA_SYNC.GET_SYNC_IMAGES',
  SYNC_IMAGES_RESPONSE: 'MEDIA_SYNC.SYNC_IMAGES_RESPONSE',
  UPLOAD_COMPLETE: 'MEDIA_SYNC.UPLOAD_COMPLETE',
};

class UploadQueueManager {
  private queue: Map<string, UploadQueueItem> = new Map();
  
  add(syncId: string, images: ProcessedImage[]): void {
    this.queue.set(syncId, {
      syncId,
      images,
      status: 'pending',
      createdAt: Date.now()
    });
    console.log('[MediaSync] 添加到上传队列:', syncId, '图片数量:', images.length);
  }
  
  get(syncId: string): UploadQueueItem | undefined {
    return this.queue.get(syncId);
  }
  
  updateStatus(syncId: string, status: UploadQueueItem['status']): void {
    const item = this.queue.get(syncId);
    if (item) {
      item.status = status;
      if (status === 'completed' || status === 'failed') {
        item.completedAt = Date.now();
      }
      console.log('[MediaSync] 更新上传状态:', syncId, '->', status);
    }
  }
  
  remove(syncId: string): void {
    this.queue.delete(syncId);
    console.log('[MediaSync] 从上传队列移除:', syncId);
  }
  
  cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.queue.forEach((item, syncId) => {
      if (item.completedAt && item.completedAt < oneHourAgo) {
        this.queue.delete(syncId);
        console.log('[MediaSync] 清理过期上传项:', syncId);
      }
    });
  }
}

export const uploadQueueManager = new UploadQueueManager();

export const isValidOrigin = (origin: string): boolean => {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.exmay.com');
  } catch {
    return false;
  }
};

export const extractFilenameFromUrl = (url: string, defaultName: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    const cleanFilename = filename.split('?')[0];
    if (cleanFilename && cleanFilename.includes('.')) {
      return cleanFilename;
    }
    return `${defaultName}.jpg`;
  } catch (e) {
    return `${defaultName}.jpg`;
  }
};

export const getImageType = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase()?.split('?')[0] || 'jpg';
  const typeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
  };
  return typeMap[extension] || 'image/jpeg';
};

export const fetchImageAsBlob = async (url: string): Promise<Blob> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('[MediaSync] 获取图片失败:', error);
    throw error;
  }
};

export const processImages = async (images: ImageData[]): Promise<ProcessedImage[]> => {
  const processedImages = await Promise.all(
    images.map(async (image, index) => {
      try {
        console.log(`[MediaSync] 处理图片 ${index + 1}/${images.length}`);
        const blob = await fetchImageAsBlob(image.src);
        
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        const name = extractFilenameFromUrl(image.src, `image-${index + 1}`);
        const type = blob.type || getImageType(image.src);
        
        return {
          name,
          data: base64,
          type,
          size: blob.size
        };
      } catch (error) {
        console.error('[MediaSync] 处理图片失败:', image.src, error);
        return null;
      }
    })
  );
  
  const result = processedImages.filter((img): img is ProcessedImage => img !== null);
  console.log('[MediaSync] 处理完成:', result.length, '张图片');
  return result;
};

export const syncImagesToMediaLibrary = async (images: ImageData[], tabId: number): Promise<boolean> => {
  try {
    const processedImages = await processImages(images);
    
    if (processedImages.length === 0) {
      console.error('[MediaSync] 没有可同步的图片');
      return false;
    }

    const syncId = `sync_${Date.now()}`;

    uploadQueueManager.add(syncId, processedImages);

    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set(
        { [syncId]: processedImages },
        () => {
          if (chrome.runtime.lastError) {
            console.warn('[MediaSync] 存储图片数据失败:', chrome.runtime.lastError);
          } else {
            console.log('[MediaSync] 图片数据已存储:', syncId);
          }
          resolve();
        }
      );
    });

    const mediaLibraryUrl = `${getPostBotBaseUrl()}/exmay/postbot/file/list?syncId=${syncId}`;

    console.log('[MediaSync] 打开素材库页面:', mediaLibraryUrl);
    const tab = await chrome.tabs.create({ url: mediaLibraryUrl });
    
    return true;
  } catch (error) {
    console.error('[MediaSync] 同步失败:', error);
    return false;
  }
};

export const syncContentImages = async (contentImages: ImageData[], tabId: number): Promise<boolean> => {
  return syncImagesToMediaLibrary(contentImages, tabId);
};

export const syncSelectionImages = async (selectionImages: ImageData[], tabId: number): Promise<boolean> => {
  return syncImagesToMediaLibrary(selectionImages, tabId);
};

export const getUploadQueueImages = (syncId: string): ProcessedImage[] | null => {
  const item = uploadQueueManager.get(syncId);
  if (item) {
    uploadQueueManager.updateStatus(syncId, 'uploading');
    return item.images;
  }
  return null;
};

export const markUploadComplete = async (syncId: string, success: boolean): Promise<void> => {
  uploadQueueManager.updateStatus(syncId, success ? 'completed' : 'failed');
  
  chrome.storage.local.remove(syncId, () => {
    console.log('[MediaSync] 已清理存储数据:', syncId);
  });
  
  uploadQueueManager.cleanup();
};

export const handleGetSyncImages = async (request: any, event: MessageEvent) => {
  console.log('[MediaSync] 处理获取同步图片请求, syncId:', request.data?.syncId);
  
  const syncId = request.data?.syncId;
  if (!syncId) {
    console.warn('[MediaSync] 没有 syncId');
    event.source?.postMessage({
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
    console.log('[MediaSync] 从队列获取图片:', queueImages.length, '张');
    
    const validImages = queueImages.filter(img => img.data);
    
    event.source?.postMessage({
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
    console.log('[MediaSync] 从存储获取图片:', images.length, '张');
    
    event.source?.postMessage({
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
};

let messageEventHandler: any = null;

export const startMediaSyncMessageListener = () => {
  messageEventHandler = async (event: MessageEvent) => {
    const request = event.data;
    
    if (request?.type !== 'request' || !request?.action) {
      return;
    }
    
    if (!isValidOrigin(event.origin)) {
      console.warn('[MediaSync] 不可信的来源:', event.origin);
      return;
    }
    
    if (request.action === MEDIA_SYNC_ACTION.GET_SYNC_IMAGES) {
      await handleGetSyncImages(request, event);
    }
  };
  
  window.addEventListener('message', messageEventHandler);
  console.log('[MediaSync] 消息监听器已启动');
};

export const stopMediaSyncMessageListener = () => {
  if (messageEventHandler) {
    window.removeEventListener('message', messageEventHandler);
    messageEventHandler = null;
    console.log('[MediaSync] 消息监听器已停止');
  }
};

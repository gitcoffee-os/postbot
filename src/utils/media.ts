import { getPostBotBaseUrl } from "~config/config";
import { image, media } from '@gitcoffee/postbot-utils';
import type { ImageData, ProcessedImage } from '@gitcoffee/postbot-utils';

export type { ImageData, ProcessedImage };
export const { isValidOrigin, extractFilenameFromUrl, getImageType, fetchImageAsBlob, processImages, uploadQueueManager, getUploadQueueImages, markUploadComplete, MEDIA_SYNC_ACTION } = { ...image, ...media };

export const syncImagesToMediaLibrary = async (images: ImageData[], tabId: number): Promise<boolean> => {
  try {
    const processedImages = await media.processImages(images);

    if (processedImages.length === 0) {
      console.error('[MediaSync] 没有可同步的图片');
      return false;
    }

    const syncId = `sync_${Date.now()}`;

    media.uploadQueueManager.add(syncId, processedImages);

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

  const queueImages = media.getUploadQueueImages(syncId);

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

    if (request.action === media.MEDIA_SYNC_ACTION.GET_SYNC_IMAGES) {
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

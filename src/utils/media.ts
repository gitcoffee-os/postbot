import { getPostBotBaseUrl } from "~config/config";
import { image, media } from '@gitcoffee-os/postbot-utils';
import type { ImageData, ProcessedImage } from '@gitcoffee-os/postbot-utils';
import { checkBridgeRequest, createBridgeResponse, normalizeOrigin } from '@gitcoffee-os/postbot-content-services';
import type { BridgeProfile } from '@gitcoffee-os/postbot-content-services';

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

export const handleGetSyncImages = async (request: any, event: MessageEvent, profile?: BridgeProfile) => {
  console.log('[MediaSync] 处理获取同步图片请求, syncId:', request.data?.syncId);

  const targetOrigin = normalizeOrigin(event.origin);
  const reply = (data: any, code = 0, message = 'success') => {
    if (!targetOrigin || !profile) return;
    (event.source as WindowProxy)?.postMessage(
      createBridgeResponse(request, data, profile, { code, message }),
      targetOrigin,
    );
  };

  const syncId = request.data?.syncId;
  if (!syncId) {
    console.warn('[MediaSync] 没有 syncId');
    reply(null, 400, 'No syncId provided');
    return;
  }

  const queueImages = media.getUploadQueueImages(syncId);

  if (queueImages && queueImages.length > 0) {
    console.log('[MediaSync] 从队列获取图片:', queueImages.length, '张');

    const validImages = queueImages.filter(img => img.data);

    reply({
      images: validImages,
      syncId: syncId
    });
    return;
  }

  chrome.storage.local.get(syncId, (result) => {
    const images = result[syncId] || [];
    console.log('[MediaSync] 从存储获取图片:', images.length, '张');

    reply({
      images: images,
      syncId: syncId
    });
  });
};

let messageEventHandler: any = null;

export const startMediaSyncMessageListener = (profile: BridgeProfile) => {
  messageEventHandler = async (event: MessageEvent) => {
    // 只处理当前页面自身的消息
    if (event.source !== window) return;

    const request = event.data;

    if (request?.type === 'response' || request?.type === undefined || !request?.action) {
      return;
    }

    if (request.action !== media.MEDIA_SYNC_ACTION.GET_SYNC_IMAGES) {
      return;
    }

    // 与主桥接同一套闸：channel 不符/来源不符直接丢弃，双装时只有一方响应
    const decision = checkBridgeRequest(request, event.origin, profile);
    if (!decision.accept) {
      return;
    }

    await handleGetSyncImages(request, event, profile);
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

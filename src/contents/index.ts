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
// 必须在最前引入，确保 Vue 求值前定义好 feature flags
import "./feature-flags";

import type { PlasmoCSConfig } from "plasmo"

import { initCopyEvent } from "~events/copy.event"

import { getReaderData } from "~media/parser"

import { POSTBOT_ACTION } from "~message/postbot.action"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

import { createApp } from 'vue'
import PostbotModal from './components/PostbotModal';
import { handleMessage } from "./services/message.services";
import { initAdapterService } from "./services/adapter.service";
import { setupI18n } from '~locales';
import { processContent } from '@gitcoffee/postbot-content-adapter';
import { debounce as debounceUtils } from '@gitcoffee/postbot-utils';
import antDesignCss from 'data-text:ant-design-vue/dist/reset.css'
import globalCss from 'data-text:../styles/global.css'
import '~plugins'

const initApp = async () => {
  const host = document.createElement('div');
  host.id = 'postbot-host';
  host.style.cssText = 'position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: visible; z-index: 2147483647;';

  const shadowRoot = host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = antDesignCss + '\n' + globalCss;
  shadowRoot.appendChild(styleEl);

  const container = document.createElement('div');
  container.id = 'postbot-container';
  shadowRoot.appendChild(container);

  document.body.appendChild(host);

  const app = createApp(PostbotModal);

  app.provide('postbot-shadow-root', shadowRoot);
  app.provide('postbot-shadow-container', container);

  await setupI18n(app, 'zh');

  app.mount(container);
}

initApp().catch((error) => {
  console.error("[PostBot] initApp failed:", error);
});

// AI 自适应修复模块：观测当前页面发布表单健康度，平台改版自动修复
void initAdapterService();

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
  }).catch(() => {});

  chrome.runtime.sendMessage({
    type: "CONTENT_DETECTED",
    content: content,
  }).catch(() => {});

  // document.body.style.background = "pink"
})

const handleSelectionChange = debounceUtils.debounce(() => {
  const selection = window.getSelection();

  const hasSelection = selection && selection.rangeCount > 0 && selection.toString().trim().length > 0;

  const selectionData: { selectionContent: string; selectionImages: { src: string }[] } = {
    selectionContent: '',
    selectionImages: [],
  };

  if (hasSelection) {
    try {
      const range = selection!.getRangeAt(0);
      const selectedHTML = range.cloneContents();
      const serializer = new XMLSerializer();
      const htmlContent = serializer.serializeToString(selectedHTML);
      const processedHtml = processContent(htmlContent);

      selectionData.selectionContent = processedHtml;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = processedHtml;
      const imgElements = tempDiv.querySelectorAll('img');
      const selectedImages = Array.from(imgElements)
        .filter((img) => img.src && !img.src.startsWith('chrome-extension://'))
        .map((img) => ({ src: img.src }));
      selectionData.selectionImages = selectedImages;
    } catch (error) {
      console.error('Error with range operations:', error);
    }
  }

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: "SELECTION_DATA",
      ...selectionData,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      hasSelection: hasSelection,
    }).catch(() => {});
  }
}, 300);

document.addEventListener("selectionchange", () => {
  // console.log("selectionchange 触发", window.getSelection()?.toString());
  // 调用选区变化处理函数
  handleSelectionChange();
});

// 发送获取到的图片URL到后台脚本

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('addListener request.action', request.action);

  // 自动发布终态中继（M3 路径 D）：background 汇总各平台结果 → 本 content script → 发布页 window.postMessage。
  // 页面侧由桌面注入的监听脚本捕获，经 renderer 上报 engine（桌面 WebContentsView 无 preload，只能走页面消息）。
  if (request?.action === POSTBOT_ACTION.AUTOPUBLISH_RESULT) {
    try {
      window.postMessage({
        type: 'response',
        traceId: request.traceId,
        action: request.action,
        code: 0,
        message: 'success',
        data: request.data,
      }, '*');
      sendResponse({ ok: true });
    } catch (err) {
      console.warn('[PostBot] AUTOPUBLISH_RESULT 中继失败:', err);
      sendResponse({ ok: false });
    }
    return true;
  }

  handleMessage(request, sender, sendResponse);

  return true;
});

// ===== 自动发布终态存储桥（路径 D 关键通道）=====
// background 交付终态时写入 chrome.storage.local；本 content script 经 onChanged
// 中继回发布页 window。Electron 下 WebContentsView 非真实 chrome.tabs.Tab，
// tabs.sendMessage/query 不可达，此通道为唯一可靠回传路径（Chrome 中与 tabs 通道并存）。
const relayAutopublishResult = (result: unknown): void => {
  try {
    window.postMessage({
      type: 'response',
      action: POSTBOT_ACTION.AUTOPUBLISH_RESULT,
      code: 0,
      message: 'success',
      data: result,
    }, '*');
  } catch (err) {
    console.warn('[PostBot] AUTOPUBLISH_RESULT 存储桥中继失败:', err);
  }
};

const AUTOPUBLISH_LATEST_KEY = 'autopublish-result:latest';
/** 启动补偿只中继近期结果，避免页面重载时回放陈旧终态（页面侧按 jobId 过滤，双保险） */
const STALE_RESULT_WINDOW_MS = 10 * 60 * 1000;

try {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    const change = changes[AUTOPUBLISH_LATEST_KEY];
    if (change?.newValue) {
      relayAutopublishResult(change.newValue);
    }
  });

  // 启动补偿：content script 注入晚于终态落库时（如页面加载慢），补中继一次
  chrome.storage.local.get(AUTOPUBLISH_LATEST_KEY, (items) => {
    const latest = items?.[AUTOPUBLISH_LATEST_KEY] as { deliveredAt?: number } | undefined;
    if (latest && typeof latest.deliveredAt === 'number' && Date.now() - latest.deliveredAt < STALE_RESULT_WINDOW_MS) {
      relayAutopublishResult(latest);
    }
  });
} catch (err) {
  console.warn('[PostBot] AUTOPUBLISH_RESULT 存储桥初始化失败:', err);
}

// ===== tabot://bridge 桥接执行器（Electron 桌面端专用，路径 D）=====
// Electron 扩展 SW 无 chrome.tabs.create/scripting.executeScript，且 MV3 SW 的
// fetch(tabot://) 被浏览器拦截、tabs.sendMessage 对 WebContentsView 不可达；
// 本 content script（isolated world，不受页面 CSP 限制）是唯一可执行
// fetch('tabot://bridge/...') 的扩展上下文。三类调用方：
// 1. SW 垫片（tabs.create 等）→ chrome.storage.local 请求键 → 本执行器 → 主进程；
// 2. 页面主世界垫片（fetchImage）→ window.postMessage（媒体平台 origin 被
//    messageEventListener 的 *.exmay.com 白名单拦截，故走独立内部标记）→ 本执行器；
// 3. 本执行器直连主进程 desktop-bridge（真实开标签 / 脚本注入 / 抓图）。
const TAB_BRIDGE_REQ_PREFIX = '__tabbridge:req:';
const TAB_BRIDGE_RESP_PREFIX = '__tabbridge:resp:';

const tabBridgeFetch = async (op: string, payload?: unknown): Promise<unknown> => {
  const res = await fetch(`tabot://bridge/${op}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `bridge ${op} HTTP ${res.status}`);
  }
  return data;
};

try {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    for (const key of Object.keys(changes)) {
      if (!key.startsWith(TAB_BRIDGE_REQ_PREFIX)) continue;
      const traceId = key.slice(TAB_BRIDGE_REQ_PREFIX.length);
      const req = changes[key]?.newValue as { op?: string; payload?: unknown } | undefined;
      if (!req?.op) continue;
      void tabBridgeFetch(req.op, req.payload)
        .then((data) => chrome.storage.local.set({ [`${TAB_BRIDGE_RESP_PREFIX}${traceId}`]: { ok: true, data } }))
        .catch((e) => chrome.storage.local.set({ [`${TAB_BRIDGE_RESP_PREFIX}${traceId}`]: { ok: false, error: String(e?.message || e) } }))
        .finally(() => chrome.storage.local.remove(key));
    }
  });
} catch (err) {
  console.warn('[PostBot] tabot bridge 存储监听初始化失败:', err);
}

try {
  window.addEventListener('message', (ev: MessageEvent) => {
    const d = ev.data as any;
    if (!d || d.__postbotTabBridge__ !== true) return;
    if (d.action !== 'fetchImage') return;
    void tabBridgeFetch('runtime/fetch-image', { imageUrl: d.imageUrl })
      .then((data: any) => {
        window.postMessage({ __postbotTabBridgeResponse__: true, traceId: d.traceId, data }, '*');
      })
      .catch((e) => {
        window.postMessage({ __postbotTabBridgeResponse__: true, traceId: d.traceId, error: String(e?.message || e) }, '*');
      });
  });
} catch (err) {
  console.warn('[PostBot] tabot bridge 页面通道初始化失败:', err);
}

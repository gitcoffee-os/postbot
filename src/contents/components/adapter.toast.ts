/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

interface AdapterToastOptions {
  type: 'success' | 'info' | 'error';
  title: string;
  description?: string;
  duration?: number;
}

let toastEl: HTMLDivElement | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

/** 在页面角落展示 AI 自适应修复提示（内容脚本世界 DOM，样式内联） */
export function showAdapterToast(options: AdapterToastOptions): void {
  const { type, title, description = '', duration = 6000 } = options;

  if (toastEl) {
    toastEl.remove();
    toastEl = null;
  }

  toastEl = document.createElement('div');
  const borderColor = type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#1677ff';
  toastEl.style.cssText = [
    'position: fixed; right: 16px; bottom: 16px; z-index: 2147483646;',
    'max-width: 320px; padding: 12px 16px; border-radius: 8px;',
    `background: #fff; border: 1px solid ${borderColor}; border-left: 4px solid ${borderColor};`,
    'box-shadow: 0 4px 16px rgba(0,0,0,0.16); font-family: -apple-system, "PingFang SC", sans-serif;',
    'animation: postbotAdapterIn .2s ease-out;',
  ].join('');

  const titleEl = document.createElement('div');
  titleEl.textContent = title;
  titleEl.style.cssText = 'font-size: 14px; font-weight: 600; color: #1f1f1f;';

  const descEl = document.createElement('div');
  descEl.textContent = description;
  descEl.style.cssText = 'margin-top: 4px; font-size: 12px; line-height: 1.5; color: #595959; word-break: break-all;';

  toastEl.appendChild(titleEl);
  if (description) toastEl.appendChild(descEl);
  document.body.appendChild(toastEl);

  const styleKey = 'postbotAdapterToastKeyframes';
  if (!document.getElementById(styleKey)) {
    const style = document.createElement('style');
    style.id = styleKey;
    style.textContent =
      '@keyframes postbotAdapterIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }';
    document.head.appendChild(style);
  }

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    toastEl?.remove();
    toastEl = null;
  }, duration);
}
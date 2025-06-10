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
export const initCopyEvent = () => {
  document.addEventListener('copy', (event) => {
    const clipboardData = event.clipboardData || window.clipboardData;

    if (clipboardData) {
      // 获取剪贴板中的文本内容
      const text = clipboardData.getData('text/plain');
      const html = clipboardData.getData('text/html');

      // 查找图片链接
      let contentImages = [];
      if (html) {
        // 解析HTML内容，提取其中的图片链接
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const imgElements = doc.querySelectorAll('img');
        imgElements.forEach(img => {
          contentImages.push(img.src);
        });
      }

      // 打印图片链接
      if (contentImages.length > 0) {
        console.log('复制的图片链接:', contentImages);
      } else {
        console.log('没有图片');
      }
    }
  });
}
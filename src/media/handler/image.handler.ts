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
export const getDocument = (html) => {
    // 使用 DOMParser 将 HTML 字符串转换为 DOM 文档
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');
    return doc;
}

export const getImgElements = (html) => {
    const doc = getDocument(html);
    const imgElements = doc?.querySelectorAll('img');
    // 过滤掉扩展自身的图片
    if (imgElements) {
        return Array.from(imgElements).filter(img => {
            const src = img.getAttribute('src');
            return src && !src.startsWith('chrome-extension://');
        });
    }
    return [];
}

export const handleContentImage = (html) => {
    let doc = getDocument(html);

    // 获取所有的 <img> 标签
    const contentImages = doc.querySelectorAll('img');

    // 遍历所有 <img> 标签并处理相对路径，同时过滤掉扩展自身的图片
    contentImages.forEach(img => {
        const src = img.getAttribute('src');
        // 过滤掉扩展自身的图片
        if (src && src.startsWith('chrome-extension://')) {
            img.remove();
        } else {
            // 处理相对路径
            const relativePath = src;
            if (relativePath && !relativePath.startsWith('http://') && !relativePath.startsWith('https://')) {
                const absolutePath = new URL(relativePath, window.location.href).href;
                img.setAttribute('src', absolutePath);
            }
        }
    });

    // 获取更新后的 HTML 内容
    return doc.body.innerHTML;
};
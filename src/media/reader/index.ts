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
import { Readability } from "@mozilla/readability";

import { state } from "~contents/components/postbot.data";

import { getImgElements } from "~media/handler/image.handler";

import { readers } from "~media/adapter";

const readerContent = () => {
    let contentData = {
        title: '',
        content: '',
        contentImages: []
    };
    try {
        const documentClone = document.cloneNode(true);
        const readability = new Readability(documentClone);
        const parsedData = readability.parse();
        if (parsedData) {
            contentData = parsedData;
        }
    } catch (e) {
        // 静默处理错误
    }
    return contentData;
}

const readerSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedHTML = range.cloneContents(); // 获取选中的 HTML 内容
        return selectedHTML;
    }
    return null;
}

export const reader = () => {
    let contentElements = null;
    const rangType = state.rangType;

    let data = {
        title: '',
        content: '',
        contentImages: [],
    };
    let contentImages = [];

    // 首先使用Readability获取页面内容
    const readabilityData = readerContent();
    
    // 如果Readability成功获取到内容，使用它
    if (readabilityData && readabilityData.content) {
        data = readabilityData;
    }
    
    // 检查是否有选中的内容
    const selectionElements = readerSelection();
    if (selectionElements && selectionElements.textContent) {
        const docFragment = selectionElements;  // 获取的 DocumentFragment
        const serializer = new XMLSerializer();
        const htmlContent = serializer.serializeToString(docFragment);  // 将 DocumentFragment 序列化为 HTML 字符串

        data.content = htmlContent;
    } else {
        // 尝试使用特定域名的reader来增强内容
        const domain = window.location.hostname;
        const reader = readers[domain] || readers['default'];
        if (reader) {
            const readerContent = reader();
            mergeData(data, readerContent);
        }
    }

    if (data.content) {
        contentImages = getImgElements(data.content);
        data.contentImages = contentImages;
    }

    return data;
}

const mergeData = (data, contentData) => {
    if (!contentData) {
        return data;
    }
    for (let key in contentData) {
        const value = contentData[key];
        if (value !== null && value !== "") {
            data[key] = value;
        }
    }
    return data;
}
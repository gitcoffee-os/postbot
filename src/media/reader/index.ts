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
    let contentData = {};
    try {
        const documentClone = document.cloneNode(true);
        contentData = new Readability(documentClone).parse();
    } catch (e) {
        console.warn('解析异常', e);
    }
    console.debug('contentData', contentData);
    return contentData;
}

const readerSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedHTML = range.cloneContents(); // 获取选中的 HTML 内容
        console.debug('selectedHTML', selectedHTML);
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

    data = readerContent();
    const selectionElements = readerSelection();
    if (selectionElements && selectionElements.textContent) {
        const docFragment = selectionElements;  // 获取的 DocumentFragment
        const serializer = new XMLSerializer();
        const htmlContent = serializer.serializeToString(docFragment);  // 将 DocumentFragment 序列化为 HTML 字符串

        data.content = htmlContent;
    } else {
        const domain = window.location.hostname;
        console.log(domain);
        const reader = readers[domain];
        if (reader) {
            const readerContent = reader();
            mergeData(data, readerContent);
        }
    }

    if (data.content) {
        contentImages = getImgElements(data.content);
        data.contentImages = contentImages;
    }

    console.debug('data.content', data.content);
    console.debug('data.contentImages', data.contentImages);

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
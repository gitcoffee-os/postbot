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
export const defaultReader = () => {
    // 尝试查找文章主体内容的常见选择器
    const articleSelectors = [
        'article',
        '[role="main"]',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.content',
        '.post',
        '.article',
        'main',
        '#content',
        '#main-content',
        '.main-content'
    ];

    let contentElement = null;

    // 尝试找到最可能包含文章内容的元素
    for (const selector of articleSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            for (const el of elements) {
                const textLength = el.textContent?.length || 0;
                if (!contentElement || textLength > (contentElement.textContent?.length || 0)) {
                    contentElement = el;
                }
            }
        }
    }

    // 如果没找到特定选择器，回退到 body
    if (!contentElement) {
        contentElement = document.body;
    }

    const content = contentElement?.innerHTML || '';

    console.debug('defaultReader content', content);

    const data = {
        content: content,
    }

    return data;
}

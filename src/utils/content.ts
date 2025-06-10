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
import { ref } from 'vue';

export const contentImages = ref([]);

export const content = ref('');

export const getSelectionContent = () => {
    // // 获取选中的内容
    // const selection = window.getSelection();
    // const range = selection.getRangeAt(0);  // 获取选中的第一个范围
    // const selectedContent = range.cloneContents();  // 获取选中的内容的副本

    // // 创建一个临时容器来解析选中的内容
    // const tempContainer = document.createElement('div');
    // tempContainer.appendChild(selectedContent);

    // // 查找选中内容中的所有图片
    // const contentImages = tempContainer.querySelectorAll('img');

    // // 输出图片的链接
    // contentImages.forEach(img => {
    // console.log(img.src);  // 或者进行其他处理
    // });
}
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
import { getMetaInfoList } from "~media/meta"
import { getWeixinMetaInfo } from "~media/meta/weixin.meta"

export const handleMetaMessage = (request, sender, sendResponse) => {
    let metaInfo = {};
    const html = request.data?.html;
    switch (request.action) {
        case 'getMetaInfoList':
            const metaInfoList = getMetaInfoList();
            sendResponse(metaInfoList);
            break;
        case 'getWeixinMetaInfo':
            metaInfo = getWeixinMetaInfo(html);
            sendResponse(metaInfo);
            break;
        default:
            break;
    }
}
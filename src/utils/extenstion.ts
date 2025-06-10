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
export const checkExtensionStatus = async () => {
    const extensionInfo = await getExtensionInfo();
    return extensionInfo?.enabled;
}

export const getExtensionInfo = async () => {
    try {
        const extensionInfo = await new Promise((resolve, reject) => {
            chrome.management.getSelf(function (extensionInfo) {
                if (extensionInfo) {
                    resolve(extensionInfo);
                } else {
                    reject("Failed to retrieve extension info");
                }
            });
        });

        if (extensionInfo.enabled) {
            console.log("This extension is enabled.");
        } else {
            console.log("This extension is disabled.");
        }
        return extensionInfo;
    } catch (error) {
        console.error(error);
    }
    return null;
}
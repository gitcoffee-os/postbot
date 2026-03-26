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
import { reactive, watch } from 'vue';

export const state = reactive({
    // 默认值为 true，但需要在 storage 加载完成后才生效
    showFlowButton: true,
    // 标记是否已从 storage 加载完成
    isStorageLoaded: false,
    rangType: 'content',
    isModalVisible: false,
    contentData: {},
    metaInfoList: {},
});

// Load showFlowButton setting from Chrome storage
const loadShowFlowButtonSetting = () => {
  chrome.storage.local.get('showFlowButton', (result) => {
    // storage 有值时优先级最高
    if (result.showFlowButton !== undefined) {
      state.showFlowButton = result.showFlowButton;
    }
    // 标记已从 storage 加载完成
    state.isStorageLoaded = true;
  });
};

// Save showFlowButton setting to Chrome storage
export const saveShowFlowButtonSetting = (show: boolean) => {
  chrome.storage.local.set({ showFlowButton: show });
};

// Watch for changes and save to storage (only after loading from storage)
watch(() => state.showFlowButton, (newValue) => {
  if (state.isStorageLoaded) {
    saveShowFlowButtonSetting(newValue);
  }
});

// Load setting when module is initialized
loadShowFlowButtonSetting();

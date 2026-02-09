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

// Application settings
export const appSettings = ref({
    exploreVersionEnabled: false
});

// Load explore version setting from Chrome storage
const loadExploreVersionSetting = () => {
  chrome.storage.local.get('exploreVersionEnabled', (result) => {
    if (result.exploreVersionEnabled !== undefined) {
      appSettings.value.exploreVersionEnabled = result.exploreVersionEnabled;
    }
  });
};

// Save explore version setting to Chrome storage
export const saveExploreVersionSetting = (enabled: boolean) => {
  chrome.storage.local.set({ exploreVersionEnabled: enabled });
};

// Load setting when module is initialized
loadExploreVersionSetting();

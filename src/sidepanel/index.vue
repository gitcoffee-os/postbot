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
<template>
    <TabsManage />
</template>

<script lang="ts" setup>
    import TabsManage from '~components/sidepanel/TabsManage.vue';

    import { contentImages, content } from '~utils/content';

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.debug('message', message);
      if (message.type === 'IMAGE_DETECTED') {
        contentImages.value = message?.contentImages;
      } else if (message.type === 'CONTENT_DETECTED') {
        content.value = message?.content;
      }
    });
</script>
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
  <div></div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { getPostBotBaseUrl } from '../config/config';

  // import type { PlasmoCSConfig } from 'plasmo';

  // export const config: PlasmoCSConfig = {
  //   // matches: ["https://www.plasmo.com/*"]
  // };

  onMounted(() => {
    chrome.tabs.create({ url: `${getPostBotBaseUrl()}/exmay/postbot/media/publish` });
  });

</script>

<style scoped>
/* 如果需要引入CSS，可以直接在这里写或者通过@import引入 */
@import '~style.css';
</style>
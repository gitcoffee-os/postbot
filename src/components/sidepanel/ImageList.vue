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
    <div class="em-ui-image-list">
        <ImagePreviewGroup class="em-ui-images">
            <Space direction="vertical" align="center">
                <Image
                    v-for="(item, index) in contentImages"
                    :key="index"
                    :height="200"
                    :width="200"
                    :src="item.src"
                    style="max-width:100%;max-height:100%;" />
            </Space>
        </ImagePreviewGroup>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { ImagePreviewGroup, Image, Space } from 'ant-design-vue';

  import { contentImages } from '~utils/content';
  </script>

<style scoped>
    .em-ui-image-list {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .em-ui-images {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
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
  <div>
    <a-divider style="font-weight: bold;">历史任务</a-divider>
    <List
      class="em-loadmore-list"
      :loading="initLoading"
      itemLayout="horizontal"
      :dataSource="list"
    >
      <template #loadMore>
        <div
          v-if="!initLoading && !loading"
          :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }"
        >
          <Button v-if="state.hasNextPage" @click="onLoadMore">加载更多</Button>
          <a-divider v-else>已加载全部</a-divider>
        </div>
      </template>
      <template #renderItem="{ item }">
        <ListItem>
          <!-- <template #actions>
            <Button key="list-loadmore-edit">edit</Button>
            <Button key="list-loadmore-more">more</Button>
          </template> -->
          <Skeleton avatar :title="false" :loading="!!item.loading" active>
            <ListItemMeta
              description=""
            >
              <template #title>
                <a href="#">{{ item.name }}</a>
              </template>
              <template #avatar>
                <Avatar :src="iconUrl" />
              </template>
            </ListItemMeta>
            <!-- <div>content</div> -->
          </Skeleton>
        </ListItem>
      </template>
    </List>
   </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, reactive, onMounted, nextTick } from 'vue';
  import 'ant-design-vue/dist/reset.css';
  import { List, Skeleton, Button, Avatar, ListItem, ListItemMeta } from 'ant-design-vue';
  
  import iconUrl from "~assets/icon.png";

  import { listApi } from '~api/media/task.api';

  const state = reactive({
    pageNo: 1,
    hasNextPage: false,
  });
  
  const initLoading = ref(true);
  const loading = ref(false);
  const list = ref([]);
  
  onMounted(() => {
    loadList();
  });

  const loadList = async() => {
    loading.value = true;
    const res = await listApi({
      pageNo: state.pageNo,
    });

    const data = res?.data;
    list.value = data.list;

    state.hasNextPage = data.hasNextPage;

    initLoading.value = false;
    loading.value = false;

    nextTick(() => {
        window.dispatchEvent(new Event('resize'));
      });
  }
  
  const onLoadMore = () => {
   loadList();
  };
  </script>
  
  <style scoped>
  .em-loadmore-list {
    min-height: 350px;
  }
  </style>  
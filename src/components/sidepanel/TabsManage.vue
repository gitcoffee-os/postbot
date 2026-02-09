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
        <div style="padding:10px;">
            <UserCard />
        </div>
        <div style="margin:20px 0;">
          <Switch v-model:checked="showFlowButton" checked-children="显示同步浮动按钮" un-checked-children="隐藏同步浮动按钮" @change="onShowSwitchChange" />
        </div>
        <div style="margin:20px 0;">
          <Switch v-model:checked="showExploreVersion" checked-children="启用探索体验版" un-checked-children="不启用探索体验版" @change="onSwitchChange" />
        </div>
        <div class="postbot-ui-main">
            
            <div style="width:100%;">
                <!-- <Divider orientation="left">同步任务</Divider> -->
            <Tabs v-model:activeKey="activeKey" :destroyInactiveTabPane="true" @change="handleTagChange">
              <TabPane :key="'1'" tab="同步任务">
                <div class="em-ui-action">
                  <Space direction="vertical" align="center">
                    <div>
                      <Empty description="你还没有进行中的同步任务" />
                    </div>
                    <a :href="`${getPostBotBaseUrl()}/exmay/postbot/media/publish`">
                      <Button type="primary" shape="round" :size="size" style="background-color:#1AAD19;background-color: #bd34fe;" @click="onPlus">
                          <template #icon>
                          <PlusOutlined />
                          </template>
                          新建同步任务
                      </Button>
                    </a>
                </Space>
              </div>
              <TaskList />
              </TabPane>

              <TabPane :key="'4'" tab="提取内容">
                <div v-if="content" v-html="content" class="em-ui-content"></div>
                <div v-else>
                  <Empty description="当前正文暂无内容" />
                </div>
              </TabPane>
              <TabPane :key="'5'" tab="选区内容">
                
              </TabPane>
              <TabPane :key="'2'" tab="内容图片">
                <div class="em-ui-action">
                  <Space direction="vertical" align="center">
                    <div v-if="!contentImages || contentImages?.length === 0">
                      <Empty description="当前正文暂无图片" />
                    </div>
                    <div v-if="contentImages?.length > 0" style="display:flex;flex-direction: row;justify-content:center;align-items: center;">
                      <Space>
                        <Button type="primary" shape="round" :size="size" style="background-color:#1AAD19;background-color: #bd34fe;">
                            <template #icon>
                            <DownloadOutlined />
                            </template>
                            下载所有图片
                        </Button>

                        <Button type="primary" shape="round" :size="size" style="background-color:#1AAD19;background-color: #bd34fe;">
                            <template #icon>
                            <CloudUploadOutlined />
                            </template>
                            同步所有图片
                        </Button>
                      </Space>
                  </div>
                </Space>
              </div>
                <ImageList v-if="contentImages?.length > 0" />
              </TabPane>

              <TabPane :key="'3'" tab="选区图片">

              </TabPane>
            </Tabs>
            </div>
        </div>
    </div>
  </template>
  
  <script lang="ts" setup>
    import {ref } from 'vue'
    import 'ant-design-vue/dist/reset.css';
    import { Space, Button, Modal, Divider, Empty, Switch } from "ant-design-vue"
    // import { Space, Card, CardMeta, Avatar, Button } from 'ant-design-vue';
    import { SettingOutlined, EditOutlined, EllipsisOutlined, PlusOutlined, DownloadOutlined, CloudUploadOutlined } from '@ant-design/icons-vue';

    import { Tabs, TabPane } from 'ant-design-vue'; // 手动引入组件

    import { contentImages, content } from '~utils/content';

    import { getPostBotBaseUrl, config } from '~config/config';

    const activeKey = ref('1');

    import UserCard from './UserCard.vue';
    import TaskList from './TaskList.vue';
    import ImageList from './ImageList.vue';

   const size = ref('normal');

    const handleTagChange = (activeKey) => {
      console.log('activeKey', activeKey);
      if (activeKey === '2') {

        chrome.runtime.sendMessage({ action: 'getcontentImages' }, (response) => {
            console.log('response', response);
            contentImages.value = response.contentImages;
        });
      } else if (activeKey === '4') {
        chrome.runtime.sendMessage({ action: 'getContent' }, (response) => {
            console.log('response', response);
            content.value = response.content;
        });

      }
    }

    // export const getStyle = () => {
    //     const style = document.createElement("style")
    //     style.textContent = antdResetCssText
    //     return style
    // }
  
  // 控制模态框的显示
  const isModalVisible = ref(false)
  const newTask = ref("")

  const showFlowButton = ref(true);

  const showExploreVersion = ref(config.value.exploreVersionEnabled);
  
  // 显示模态框
  const showModal = () => {
    isModalVisible.value = true
  }
  
  // 处理模态框确认
  const handleOk = () => {
    if (newTask.value) {

    }
    newTask.value = ""
    isModalVisible.value = false
  }
  
  // 处理模态框取消
  const handleCancel = () => {
    newTask.value = ""
    isModalVisible.value = false
  }

  const onPlus = () => {
    chrome.tabs.create({ url: `${getPostBotBaseUrl()}/exmay/postbot/media/publish` });
  }

  const onShowSwitchChange = (checked) => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { action: 'setFlowButton', showFlowButton: checked }, (response) => {
        console.log('response', response);
      });
    });

  }

  const onSwitchChange = (checked) => {
    showExploreVersion.value = checked;
    config.value.exploreVersionEnabled = checked;
  }
  </script>
  
  <style lang="less" scoped>
  :deep(.ant-switch.ant-switch-checked) {
    background: #bd34fe !important;
  }
  /* 设置页面布局 */
  .logo {
    color: #fff;
    font-size: 18px;
    text-align: center;
    lineHeight: 64px;
  }

  .postbot-ui-main {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .em-ui-action {
    width:100%;
    display:flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }

  .em-ui-content :deep(img) {
    max-width: 100%;
  }
  </style>  
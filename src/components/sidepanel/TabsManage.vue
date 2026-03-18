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
          <Switch v-model:checked="config.exploreVersionEnabled" checked-children="启用探索体验版" un-checked-children="不启用探索体验版" @change="onSwitchChange" />
        </div>
        <div class="postbot-ui-main">
            
            <div style="width:100%;">
                <!-- <Divider orientation="left">同步任务</Divider> -->
            <Tabs v-model:activeKey="activeKey" @change="handleTagChange">
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
                <div id="selection-content-container" class="em-ui-content">
                  <div v-if="localSelectionContent" v-html="localSelectionContent"></div>
                  <div v-else>
                    <Empty description="当前选区暂无内容，请在页面中选择文本" />
                  </div>
                </div>
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
                <div class="em-ui-action">
                  <Space direction="vertical" align="center">
                    <div id="selection-images-empty" v-if="!localSelectionImages || localSelectionImages?.length === 0">
                      <Empty description="当前选区暂无图片，请在页面中选择包含图片的内容" />
                    </div>
                    <div id="selection-images-buttons" v-if="localSelectionImages?.length > 0" style="display:flex;flex-direction: row;justify-content:center;align-items: center;">
                      <Space>
                        <Button type="primary" shape="round" :size="size" style="background-color:#1AAD19;background-color: #bd34fe;">
                            <template #icon>
                            <DownloadOutlined />
                            </template>
                            下载选区图片
                        </Button>

                        <Button type="primary" shape="round" :size="size" style="background-color:#1AAD19;background-color: #bd34fe;">
                            <template #icon>
                            <CloudUploadOutlined />
                            </template>
                            同步选区图片
                        </Button>
                      </Space>
                  </div>
                </Space>
              </div>
                <div id="selection-images-container" v-if="localSelectionImages?.length > 0" class="em-ui-image-list">
                  <ImagePreviewGroup class="em-ui-images">
                    <Space direction="vertical" align="center">
                      <Image
                        v-for="(item, index) in localSelectionImages"
                        :key="index"
                        :height="200"
                        :width="200"
                        :src="item.src"
                        style="max-width:100%;max-height:100%;" />
                    </Space>
                  </ImagePreviewGroup>
                </div>
              </TabPane>
            </Tabs>
            </div>
        </div>
    </div>
  </template>
  
  <script lang="ts" setup>
    import {ref, onMounted, onActivated, watch, nextTick, reactive, toRefs } from 'vue'
    import 'ant-design-vue/dist/reset.css';
    import { Space, Button, Modal, Divider, Empty, Switch, ImagePreviewGroup, Image } from "ant-design-vue"
    // import { Space, Card, CardMeta, Avatar, Button } from 'ant-design-vue';
    import { SettingOutlined, EditOutlined, EllipsisOutlined, PlusOutlined, DownloadOutlined, CloudUploadOutlined } from '@ant-design/icons-vue';

    import { Tabs, TabPane } from 'ant-design-vue'; // 手动引入组件

    import { contentImages, content } from '~utils/content';

    import { getPostBotBaseUrl, config, saveExploreVersionSetting } from '~config/config';

    const activeKey = ref('1');

    // 创建响应式对象
    const selectionState = reactive({
      content: '',
      images: []
    });

    // 转换为ref以便在模板中使用
    const { content: localSelectionContent, images: localSelectionImages } = toRefs(selectionState);

    // 直接监听消息，不使用全局变量
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'SELECTION_DATA') {
            // 直接更新响应式对象
            selectionState.content = message.selectionContent;
            selectionState.images = message.selectionImages;
            
            // 直接更新DOM，确保实时显示
            updateSelectionDOM(message.selectionContent, message.selectionImages);
        } else if (message.type === 'TEST_SELECTION_DATA') {
            // 直接更新DOM，确保实时显示
            updateSelectionDOM(message.selectionContent, message.selectionImages);
        }
    });

    // 直接更新DOM的函数
    const updateSelectionDOM = (content, images) => {
        // 更新选区内容
        const contentContainer = document.getElementById('selection-content-container');
        if (contentContainer) {
            if (content) {
                contentContainer.innerHTML = `<div>${content}</div>`;
            } else {
                contentContainer.innerHTML = `<div style="text-align: center; padding: 20px;"><div style="color: #999; font-size: 14px;">当前选区暂无内容，请在页面中选择文本</div></div>`;
            }
        }
        
        // 更新选区图片
        const imagesEmpty = document.getElementById('selection-images-empty');
        const imagesButtons = document.getElementById('selection-images-buttons');
        const imagesContainer = document.getElementById('selection-images-container');
        
        if (imagesEmpty && imagesButtons && imagesContainer) {
            if (images && images.length > 0) {
                imagesEmpty.style.display = 'none';
                imagesButtons.style.display = 'flex';
                imagesContainer.style.display = 'block';
            } else {
                imagesEmpty.style.display = 'block';
                imagesButtons.style.display = 'none';
                imagesContainer.style.display = 'none';
            }
        }
    };

    import UserCard from './UserCard.vue';
    import TaskList from './TaskList.vue';
    import ImageList from './ImageList.vue';

   const size = ref('normal');

    const handleTagChange = (activeKey) => {
      if (activeKey === '2') {

        chrome.runtime.sendMessage({ action: 'getImages' }, (response) => {
            contentImages.value = response.contentImages;
        });
      } else if (activeKey === '4') {
        chrome.runtime.sendMessage({ action: 'getContent' }, (response) => {
            content.value = response.content;
        });

      } else if (activeKey === '5' || activeKey === '3') {
        chrome.runtime.sendMessage({ action: 'getSelectionContent' }, (response) => {
            if (response) {
              // 直接更新本地变量
              localSelectionContent.value = response.selectionContent;
              localSelectionImages.value = response.selectionImages;
            }
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
    config.value.exploreVersionEnabled = checked;
    saveExploreVersionSetting(checked);
  }
  
  // 当侧边栏显示时重新获取数据
  onActivated(() => {
    refreshAllData();
  });
  
  // 监听标签页变化，当页面切换时重新获取数据
  onMounted(() => {
    // 监听标签页激活事件
    chrome.tabs.onActivated.addListener((activeInfo) => {
      refreshAllData();
    });
    
    // 监听标签页URL变化事件
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url) {
        // 只在当前标签页URL变化时刷新数据
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].id === tabId) {
            refreshAllData();
          }
        });
      }
    });
    
    // 初始获取数据
    refreshAllData();
  });
  
  // 刷新所有数据的函数
  const refreshAllData = () => {
    // 获取内容数据
    chrome.runtime.sendMessage({ action: 'getContent' }, (response) => {
      if (response) {
        content.value = response.content;
      }
    });
    // 获取图片数据
    chrome.runtime.sendMessage({ action: 'getImages' }, (response) => {
      if (response) {
        contentImages.value = response.contentImages;
      }
    });
    // 获取选区数据
    chrome.runtime.sendMessage({ action: 'getSelectionContent' }, (response) => {
      if (response) {
        // 直接更新响应式对象
        selectionState.content = response.selectionContent;
        selectionState.images = response.selectionImages;
      }
    });
  };
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

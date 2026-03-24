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
                        <Button type="primary" shape="round" :size="size" style="background-color:#1AAD19;background-color: #bd34fe;" @click="downloadAllContentImages">
                            <template #icon>
                            <DownloadOutlined />
                            </template>
                            下载所有图片
                        </Button>

                        <Button type="primary" shape="round" :size="size" style="background-color:#1AAD19;background-color: #bd34fe;" @click="handleSyncContentImages">
                            <template #icon>
                            <CloudUploadOutlined />
                            </template>
                            同步至素材库
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
                        <Button type="primary" shape="round" :size="size" style="background-color:#1AAD19;background-color: #bd34fe;" @click="downloadSelectionImages">
                            <template #icon>
                            <DownloadOutlined />
                            </template>
                            下载选区图片
                        </Button>

                        <Button type="primary" shape="round" :size="size" style="background-color:#1AAD19;background-color: #bd34fe;" @click="handleSyncSelectionImages">
                            <template #icon>
                            <CloudUploadOutlined />
                            </template>
                            同步至素材库
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
    import {ref, onMounted, onActivated, onUnmounted, watch, nextTick, reactive, toRefs } from 'vue'
    import 'ant-design-vue/dist/reset.css';
    import { Space, Button, Modal, Divider, Empty, Switch, ImagePreviewGroup, Image, message } from "ant-design-vue"
    // import { Space, Card, CardMeta, Avatar, Button } from 'ant-design-vue';
    import { SettingOutlined, EditOutlined, EllipsisOutlined, PlusOutlined, DownloadOutlined, CloudUploadOutlined } from '@ant-design/icons-vue';

    import { Tabs, TabPane } from 'ant-design-vue'; // 手动引入组件

    import { contentImages, content } from '~utils/content';

    import { getPostBotBaseUrl, config, saveExploreVersionSetting } from '~config/config';

    import JSZip from 'jszip';
    import { saveAs } from 'file-saver';

    import dayjs from 'dayjs';

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
    import { syncContentImages, syncSelectionImages, startMediaSyncMessageListener, stopMediaSyncMessageListener } from '~utils/media';

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
  
  // 从 URL 中提取文件名
  const extractFilenameFromUrl = (url, defaultName) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
      // 如果文件名包含查询参数，移除它们
      const cleanFilename = filename.split('?')[0];
      // 如果文件名包含扩展名，返回它，否则返回默认名称
      if (cleanFilename && cleanFilename.includes('.')) {
        return cleanFilename;
      }
      return `${defaultName}.jpg`;
    } catch (e) {
      return `${defaultName}.jpg`;
    }
  };

  // 获取文件扩展名
  const getFileExtension = (filename) => {
    const match = filename.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : 'jpg';
  };

  // 将图片 URL 转换为 Blob
  const fetchImageAsBlob = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  };

  // 打包下载图片
  const downloadImagesAsZip = async (images, zipName) => {
    if (!images || images.length === 0) {
      message.warning('没有可下载的图片');
      return;
    }

    // 生成带时间戳的文件名
    const timestamp = dayjs().format('YYYY-MM-DD-HH-mm-ss');
    const timestampedZipName = `${zipName}_${timestamp}`;

    const loadingMessage = message.loading('正在打包图片，请稍候...', 0);

    try {
      const zip = new JSZip();
      const folder = zip.folder(zipName);

      // 用于检测重复文件名
      const usedFilenames = new Set();

      // 并发下载所有图片
      const downloadPromises = images.map(async (image, index) => {
        try {
          const originalFilename = extractFilenameFromUrl(image.src, `image-${index + 1}`);
          let filename = originalFilename;

          // 处理重复文件名
          if (usedFilenames.has(filename)) {
            const ext = getFileExtension(filename);
            const baseName = filename.substring(0, filename.lastIndexOf('.'));
            let counter = 1;
            while (usedFilenames.has(filename)) {
              filename = `${baseName}_${counter}.${ext}`;
              counter++;
            }
          }
          usedFilenames.add(filename);

          const blob = await fetchImageAsBlob(image.src);
          folder.file(filename, blob);
        } catch (error) {
          console.error(`Failed to download image ${index + 1}:`, error);
        }
      });

      await Promise.all(downloadPromises);

      // 生成并下载 zip 文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${timestampedZipName}.zip`);

      message.success('图片打包成功，请确认下载');
    } catch (error) {
      console.error('Error creating zip:', error);
      message.error('打包下载失败，请重试');
    } finally {
      loadingMessage();
    }
  };

  // 下载所有内容图片
  const downloadAllContentImages = () => {
    downloadImagesAsZip(contentImages.value, 'content-images');
  };

  // 下载选区图片
  const downloadSelectionImages = () => {
    downloadImagesAsZip(localSelectionImages.value, 'selection-images');
  };

  // 同步内容图片至素材库
  const handleSyncContentImages = async () => {
    if (!contentImages.value || contentImages.value.length === 0) {
      message.warning('没有可同步的内容图片');
      return;
    }

    const loadingMessage = message.loading('正在同步图片，请稍候...', 0);
    
    try {
      // 获取当前标签页 ID
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]) {
          const success = await syncContentImages(contentImages.value, tabs[0].id);
          if (success) {
            message.success('图片同步已开始，正在跳转到素材库...');
          } else {
            message.error('图片同步失败，请重试');
          }
        } else {
          message.error('无法获取当前标签页信息');
        }
        loadingMessage();
      });
    } catch (error) {
      console.error('同步内容图片失败:', error);
      message.error('同步失败，请重试');
      loadingMessage();
    }
  };

  // 同步选区图片至素材库
  const handleSyncSelectionImages = async () => {
    if (!localSelectionImages.value || localSelectionImages.value.length === 0) {
      message.warning('没有可同步的选区图片');
      return;
    }

    const loadingMessage = message.loading('正在同步图片，请稍候...', 0);
    
    try {
      // 获取当前标签页 ID
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]) {
          const success = await syncSelectionImages(localSelectionImages.value, tabs[0].id);
          if (success) {
            message.success('图片同步已开始，正在跳转到素材库...');
          } else {
            message.error('图片同步失败，请重试');
          }
        } else {
          message.error('无法获取当前标签页信息');
        }
        loadingMessage();
      });
    } catch (error) {
      console.error('同步选区图片失败:', error);
      message.error('同步失败，请重试');
      loadingMessage();
    }
  };
  
  // 当侧边栏显示时重新获取数据
  onActivated(() => {
    refreshAllData();
  });
  
  // 监听标签页变化，当页面切换时重新获取数据
  onMounted(() => {
    startMediaSyncMessageListener();
    
    chrome.tabs.onActivated.addListener((activeInfo) => {
      refreshAllData();
    });
    
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].id === tabId) {
            refreshAllData();
          }
        });
      }
    });
    
    refreshAllData();
  });
  
  onUnmounted(() => {
    stopMediaSyncMessageListener();
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

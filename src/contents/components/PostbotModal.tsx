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
import { computed, defineComponent, h, ref } from 'vue'
import { Button, Modal, Avatar } from 'ant-design-vue'
// import { PlasmoCSConfig } from "plasmo";

import { SyncOutlined } from '@ant-design/icons-vue';

import PostbotButton from './PostbotButton'

import PostbotFloatButton from './PostBotFloatButton';

import { getReaderData } from '~media/parser'

import { state } from './postbot.data';

import iconUrl from "~assets/icon.png";

import { POSTBOT_ACTION } from '~message/postbot.action';

import { BASE_URL } from '~config/config';

// import { state } from './postbot.data';

// import cssText from 'data-text:./postbot.styles.css';

// export const config: PlasmoCSConfig = {
//   // matches: ["https://www.plasmo.com/*"],
//   // css: ["font.css"]
// };

// export const getStyle = () => {
//   const style = document.createElement("style");
//   style.textContent = cssText;
//   return style;
// };

export default defineComponent({
  name: 'PostbotModal',
  setup() {
    // 创建一个变量来控制 Modal 是否显示
    // const isModalVisible = ref(false)

    const contentData = ref({});
    const content = ref('');
    const title = ref('');

    // 点击按钮时打开 Modal
    const handleClick = () => {
      chrome.runtime.sendMessage({ type: 'request', action: 'checkLogin' }, (response) => {
        console.log('response', response);
        if (response.isLogin) {
          state.isModalVisible = true;
        } else {
          window.open(`${BASE_URL}/exmay/postbot/media/publish`, '_blank');
        }
      });

    }

    // 关闭 Modal
    const handleCancel = () => {
      state.isModalVisible = false
    }

    const onOk = () => {

      chrome.runtime.sendMessage({
        type: 'request',
        action: POSTBOT_ACTION.PUBLISH_SYNC_DATA,
        data: contentData.value,
      });

      const newWindow = window.open(`${BASE_URL}/exmay/postbot/media/publish`, '_blank');
      if (newWindow) {
        newWindow.onload = () => {
          console.log('同步数据');
          contentData.value = null;
        }
      }

      state.isModalVisible = false;
    }

    const getContent = () => {
      const data = getReaderData();
      contentData.value = data;
      title.value = data?.title;
      console.log('title.value', title.value);
      return data?.content + '<style>img { max-width: 100%; } </style>';
    }

    return () =>
      h('div', {
        style: {
          width: '100%',
          height: '100%',
        }
      }, [
        // h(Button, { type: 'primary', onClick: handleClick }, '点击打开 Modal'),
        // h(PostbotButton, { onClick: handleClick }),
        state.showFlowButton ? h(PostbotFloatButton, { onClick: handleClick }) : null,
        state.isModalVisible ?
          // 使用 Ant Design Vue 的 Modal 组件
          h(Modal, {
            open: state.isModalVisible,
            onCancel: handleCancel,
            destroyOnClose: true,
            // footer: null,
            okText: '立即同步',
            cancelText: '取消',
            width: '80vw',
            wrapClassName: 'em-ui-postbot-modal',
            bodyStyle: {
              height: '70vh', // 设置内容区域的高度
              // overflowY: 'auto' // 设置垂直滚动条，如果内容超出高度
            },
            style: {
              // border: '1px solid #1AAD19',
              // boxShadow: '0 1px 2px -2px #8bc34a, 0 3px 6px 0 #8bc34a, 0 5px 12px 4px #8bc34a',
            },
            okButtonProps: {
              icon: h(SyncOutlined),
              style: {
                // backgroundColor: '#1AAD19',
                backgroundColor: '#ff4d4f',
              }
            },
            // title: `${title.value} - 内容预览`,
            // title: () => h('div', {}, [
            //   h(Avatar, { 
            //     src: iconUrl,
            //     size: 18,
            //   //   size: 26,
            //   }),
            //   h('div', {}, 'PostBot内容同步助手'),
            //   h('div', {}, `${title.value} - 内容预览`)
            // ]),
            onOk: onOk,
            zIndex: 1000000,
            // content: computed(() => getContent()),
          }, {
            title: () => h('div', {}, [
              h('div', {
                style: {
                  position: 'absolute',
                }
              }, [
                h(Avatar, {
                  src: iconUrl,
                  size: 26,
                  //   size: 26,
                }),
                h('span', {
                  style: {
                    // color: '#1AAD19',
                    color: '#bd34fe',
                    // fontWeight: 'bold',
                    display: 'inline-block',
                    marginLeft: '5px',
                  }
                }, 'PostBot内容同步助手'),
              ]),
              h('div', {
                style: {
                  textAlign: 'center',
                  // color: '#1AAD19',
                  color: '#bd34fe',
                }
              }, '内容预览'),
              h('div', {
                style: {
                  textAlign: 'center',
                  marginTop: '10px',
                }
              }, `${title.value}`)
            ]),
            // default: () => h('p', '')
            // default: () => h('div', { innerHTML: getContent() }) 
            default: () =>
              h('div', {
                style: {
                  width: '100%',
                  height: '100%' // 确保父容器高度为 100%
                }
              }, [
                h('iframe', {
                  srcdoc: getContent(), // 将 htmlContent 插入到 iframe 中
                  width: '100%',
                  height: '100%',
                  frameborder: '0'
                })
              ])
          }) : null
      ])
  }
})
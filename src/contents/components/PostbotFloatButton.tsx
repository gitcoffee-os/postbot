
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
import { defineComponent, h } from 'vue'
import { Button, FloatButtonGroup, FloatButton, Avatar } from 'ant-design-vue'
import { SyncOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';

import iconUrl from "~assets/icon.png";

export default defineComponent({
  name: 'PostbotFloatButton',
  setup(props, { emit }) {

    // 点击按钮的处理逻辑
    const handleClick = () => {
      emit('click'); // 触发父组件传递的 show 事件
      // alert('按钮点击了！')
    }

    return () =>
      h(
        FloatButtonGroup,
        {
          // shape: 'circle', 
          shape: 'square',
          style: {
            top: '200px',
            bottom: 'auto',
            // border: '1px solid #1AAD19',
            border: '1px solid #bd34fe',
            width: 'auto',
            zIndex: 9999,
            // boxShadow: '0 1px 2px -2px #8bc34a, 0 3px 6px 0 #8bc34a, 0 5px 12px 4px #8bc34a',
            boxShadow: '0 1px 2px -2px #bd34fe, 0 3px 6px 0 #47caff, 0 5px 12px 4px #bd34fe',
            background: '#ffffff',
          }
        },
        {
          default: () => [
            h(
              FloatButton,
              {
                //   badge: { count: 5, color: 'red' },
                //   style: {
                //     right: '50px',
                //   },
                onClick: handleClick,
              },
              {
                description: () => h('div', {
                  style: {
                    // color: '#1AAD19',
                    color: '#bd34fe',
                    fontWeight: 'bold',
                  }
                },
                  //   '内容同步'
                  '同步'
                ),
                tooltip: () => h('div', 'PostBot内容同步助手'),
                //   icon: () => h(SyncOutlined)
                icon: () =>
                  h(Avatar, {
                    src: iconUrl,
                    size: 18,
                    //   size: 26,
                  })
              }
            )
          ]
        }
      );
  }
})
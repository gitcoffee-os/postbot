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
import { Button } from 'ant-design-vue'
import { SyncOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  name: 'PostbotButton',
  setup(props, { emit }) {

    // 点击按钮的处理逻辑
    const handleClick = () => {
      emit('click'); // 触发父组件传递的 show 事件
      // alert('按钮点击了！')
    }

    return () =>
      h('div', { style: { position: 'fixed', top: '200px', right: '10px', zIndex: 9999 } }, [
        // h(Button, { type: 'primary', icon: h(SyncOutlined), style: {backgroundColor: '#1AAD19'}, onClick: handleClick }, '内容同步')
        h(Button, { type: 'primary', icon: h(SyncOutlined), style: { backgroundColor: '#bd34fe' }, onClick: handleClick }, '内容同步')
      ])
  }
})
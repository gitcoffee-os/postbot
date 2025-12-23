
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
import { defineComponent, h, ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Button, FloatButtonGroup, FloatButton, Avatar } from 'ant-design-vue'
import { SyncOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';

import iconUrl from "~assets/icon.png";

export default defineComponent({
  name: 'PostbotFloatButton',
  setup(props, { emit }) {
    // 拖动相关状态
    const isMouseDown = ref(false); // 鼠标是否按下
    const isDragging = ref(false);
    const hasDragged = ref(false); // 标记是否发生过拖动
    const dragStartX = ref(0);
    const dragStartY = ref(0);
    const originalPosition = ref({ x: 0, y: 0 }); // 记录初始位置
    // 初始化默认位置（同步），确保有合理的默认值
    const getDefaultPosition = () => {
      const buttonWidth = 50;
      return {
        x: Math.max(0, (document.documentElement?.clientWidth || 1200) - buttonWidth),
        y: 200
      };
    };

    const position = ref(getDefaultPosition());
    const positionLoaded = ref(true); // 初始就设置为已加载

    // 从 chrome.storage 加载保存的位置
    const loadPosition = async () => {
      try {
        const result = await chrome.storage.local.get(['postbot-float-button-position']);
        if (result['postbot-float-button-position']) {
          const savedPosition = result['postbot-float-button-position'];
          // 确保位置在合理范围内，确保按钮完全可见
          const buttonWidth = 50;
          const buttonHeight = 50;
          position.value = {
            x: Math.max(0, Math.min(savedPosition.x, document.documentElement.clientWidth - buttonWidth)),
            y: Math.max(0, Math.min(savedPosition.y, document.documentElement.clientHeight - buttonHeight))
          };
        }
        // 位置已加载（或保持默认位置）
      } catch (error) {
        console.warn('Failed to load float button position:', error);
        // 出错时保持默认位置
      }
    };

    // 保存位置到 chrome.storage
    const savePosition = async () => {
      try {
        await chrome.storage.local.set({
          'postbot-float-button-position': position.value
        });
      } catch (error) {
        console.warn('Failed to save float button position:', error);
      }
    };

    // 鼠标按下事件
    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown.value = true;
      isDragging.value = false; // 先不设置为 true，等待确认是否是拖动
      hasDragged.value = false;
      originalPosition.value = { ...position.value };
      dragStartX.value = event.clientX - position.value.x;
      dragStartY.value = event.clientY - position.value.y;
      event.preventDefault();
      event.stopPropagation();
    };

    // 鼠标移动事件
    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown.value) return; // 只有在鼠标按下时才处理

      // 检查是否移动了足够距离，认为是拖动操作
      const deltaX = Math.abs(event.clientX - (originalPosition.value.x + dragStartX.value));
      const deltaY = Math.abs(event.clientY - (originalPosition.value.y + dragStartY.value));

      if (deltaX > 5 || deltaY > 5) {
        if (!isDragging.value) {
          isDragging.value = true;
          hasDragged.value = true;
        }

        if (isDragging.value) {
          position.value.x = event.clientX - dragStartX.value;
          position.value.y = event.clientY - dragStartY.value;

          // 限制在视窗范围内，确保按钮完全可见
          // 估算按钮尺寸：Avatar(18px) + padding + border ≈ 50px
          const buttonWidth = 50;
          const buttonHeight = 50;
          const maxX = document.documentElement.clientWidth - buttonWidth;
          const maxY = document.documentElement.clientHeight - buttonHeight;

          position.value.x = Math.max(0, Math.min(position.value.x, maxX));
          position.value.y = Math.max(0, Math.min(position.value.y, maxY));
        }
      }
    };

    // 鼠标释放事件
    const handleMouseUp = () => {
      if (isDragging.value && hasDragged.value) {
        savePosition(); // 异步保存
      }
      // 重置状态，但保留 hasDragged 用于阻止点击事件
      isMouseDown.value = false;
      isDragging.value = false;
    };

    // 点击按钮的处理逻辑
    const handleClick = () => {
      if (hasDragged.value) {
        // 如果刚刚进行了拖动，重置标志并阻止点击事件
        hasDragged.value = false;
        return;
      }
      emit('click'); // 触发父组件传递的 show 事件
    };

    // 计算属性：控制 tooltip 是否显示
    const showTooltip = computed(() => !isDragging.value);

    // 处理 chrome.storage 的变化
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes['postbot-float-button-position'] && changes['postbot-float-button-position'].newValue) {
        position.value = changes['postbot-float-button-position'].newValue;
      }
    };

    // 组件挂载时添加全局事件监听器并加载位置
    onMounted(async () => {
      await loadPosition();
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      chrome.storage.onChanged.addListener(handleStorageChange);
    });

    // 组件卸载时移除事件监听器
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      chrome.storage.onChanged.removeListener(handleStorageChange);
    });

    return () =>
      h(
        FloatButtonGroup,
        {
          // shape: 'circle',
          shape: 'square',
          style: {
            position: 'fixed',
            left: `${position.value.x}px`,
            top: `${position.value.y}px`,
            bottom: 'auto',
            right: 'auto',
            // border: '1px solid #1AAD19',
            border: '1px solid #bd34fe',
            width: 'auto',
            zIndex: 999999,
            // boxShadow: '0 1px 2px -2px #8bc34a, 0 3px 6px 0 #8bc34a, 0 5px 12px 4px #8bc34a',
            boxShadow: isDragging.value
              ? '0 4px 8px -2px rgba(189, 52, 254, 0.5), 0 6px 12px 0 rgba(71, 202, 255, 0.5), 0 8px 16px 4px rgba(189, 52, 254, 0.5)'
              : '0 1px 2px -2px #bd34fe, 0 3px 6px 0 #47caff, 0 5px 12px 4px #bd34fe',
            background: '#ffffff',
            cursor: isDragging.value ? 'grabbing' : 'grab',
            userSelect: 'none',
            transition: !isDragging.value ? 'left 0.3s ease, top 0.3s ease' : 'none', // 拖动时无过渡
          },
          onMousedown: handleMouseDown,
        },
        {
          default: () => [
            h(
              FloatButton,
              {
                shape: 'square',
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
                ...(showTooltip.value ? { tooltip: () => h('div', {
                  style: {
                    // color: '#bd34fe !important',
                    // fontSize: '14px !important',
                    // fontWeight: '500 !important',
                    // padding: '8px 12px !important',
                    // backgroundColor: '#ffffff !important',
                    // border: '1px solid #bd34fe !important',
                    // borderRadius: '6px !important',
                    // boxShadow: '0 2px 8px rgba(189, 52, 254, 0.15) !important',
                    // margin: '0 !important',
                    // textAlign: 'left !important',
                  }
                }, 'PostBot内容同步助手') } : {}),
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
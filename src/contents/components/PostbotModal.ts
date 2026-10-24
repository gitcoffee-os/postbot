import { h, defineComponent, inject } from 'vue'
import { StyleProvider } from 'ant-design-vue/es/_util/cssinjs'
import { ConfigProvider } from 'ant-design-vue'
import { createModal } from '@gitcoffee-os/postbot-content-ui'
import PostbotFloatButton from './PostbotFloatButton'
import { getReaderData } from '~media/parser'
import { state } from './postbot.data'
import iconUrl from "~assets/icon.png"
import { POSTBOT_ACTION } from '~message/postbot.action'
import { getPostBotBaseUrl, getPublishPath } from '~config/config'
import { useTranslation } from '~locales'

export default defineComponent({
  name: 'PostbotModal',
  setup() {
    const shadowRoot = inject<ShadowRoot>('postbot-shadow-root');
    const shadowContainer = inject<HTMLElement>('postbot-shadow-container');

    const PostbotModalInner = createModal({
      state,
      iconUrl,
      assistantLabel: () => useTranslation()('postbot:postbot.content_sync_assistant'),
      previewLabel: () => useTranslation()('postbot:postbot.content_preview'),
      syncNowLabel: () => useTranslation()('postbot:postbot.sync_now'),
      cancelLabel: () => useTranslation()('postbot:common.cancel'),
      getBaseUrl: getPostBotBaseUrl,
      publishPath: getPublishPath(),
      actionSyncData: POSTBOT_ACTION.PUBLISH_SYNC_DATA,
      getReaderData,
      ...(shadowContainer ? { getContainer: () => shadowContainer } : {}),
    });

    const handleClick = () => {
      const onLoginResponse = (response: any) => {
        if (response?.isLogin) {
          state.rangType = 'content';
          state.isModalVisible = true;
        } else {
          window.open(`${getPostBotBaseUrl()}${getPublishPath()}`, '_blank');
        }
      };

      try {
        chrome.runtime.sendMessage({ type: 'request', action: 'checkLogin' }, (response) => {
          if (chrome.runtime.lastError) {
            return;
          }
          onLoginResponse(response);
        });
      } catch (error) {
        console.warn('[PostBot] checkLogin failed:', error);
      }
    }

    const getPopupContainer = shadowContainer ? () => shadowContainer : undefined;

    return () =>
      h(StyleProvider, {
        container: shadowRoot,
      }, {
        default: () =>
          h(ConfigProvider, {
            getPopupContainer,
          }, {
            default: () =>
              h('div', {
                style: {
                  width: '100%',
                  height: '100%',
                }
              }, [
                state.showFlowButton ? h(PostbotFloatButton, { onClick: handleClick }) : null,
                h(PostbotModalInner),
              ])
          })
      })
  }
})

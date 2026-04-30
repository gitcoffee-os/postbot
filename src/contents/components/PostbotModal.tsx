import { h, defineComponent } from 'vue'
import { createModal } from '@gitcoffee/postbot-content-ui'
import PostbotFloatButton from './PostbotFloatButton'
import { getReaderData } from '~media/parser'
import { state } from './postbot.data'
import iconUrl from "~assets/icon.png"
import { POSTBOT_ACTION } from '~message/postbot.action'
import { getPostBotBaseUrl } from '~config/config'

const PostbotModalInner = createModal({
  state,
  iconUrl,
  assistantLabel: 'PostBot内容同步助手',
  previewLabel: '内容预览',
  syncNowLabel: '立即同步',
  cancelLabel: '取消',
  getBaseUrl: getPostBotBaseUrl,
  publishPath: '/exmay/postbot/media/publish',
  actionSyncData: POSTBOT_ACTION.PUBLISH_SYNC_DATA,
  getReaderData,
});

export default defineComponent({
  name: 'PostbotModal',
  setup() {
    const handleClick = () => {
      chrome.runtime.sendMessage({ type: 'request', action: 'checkLogin' }, (response) => {
        if (response.isLogin) {
          state.isModalVisible = true;
        } else {
          window.open(`${getPostBotBaseUrl()}/exmay/postbot/media/publish`, '_blank');
        }
      });
    }

    return () =>
      h('div', {
        style: {
          width: '100%',
          height: '100%',
        }
      }, [
        state.showFlowButton ? h(PostbotFloatButton, { onClick: handleClick }) : null,
        h(PostbotModalInner),
      ])
  }
})

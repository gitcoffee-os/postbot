import { createFloatButton } from '@gitcoffee/postbot-content-ui';
import iconUrl from "~assets/icon.png";

const PostbotFloatButton = createFloatButton({
  storageKey: 'postbot-float-button-position',
  iconUrl,
  syncLabel: '同步',
  tooltipLabel: 'PostBot内容同步助手',
});

export default PostbotFloatButton;

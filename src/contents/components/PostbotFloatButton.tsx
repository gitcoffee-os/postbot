import { createFloatButton } from '@gitcoffee/postbot-content-ui';
import { useTranslation } from '~locales';
import iconUrl from "~assets/icon.png";

const PostbotFloatButton = createFloatButton({
  storageKey: 'postbot-float-button-position',
  iconUrl,
  syncLabel: () => useTranslation()('postbot:postbot.content_sync'),
  tooltipLabel: () => useTranslation()('postbot:postbot.content_sync_assistant'),
});

export default PostbotFloatButton;

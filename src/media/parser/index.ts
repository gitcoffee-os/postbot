import { createParser } from '@gitcoffee/postbot-media';
import { state } from "~contents/components/postbot.data";
import { defaultReader } from "~media/adapter";

const { parse } = createParser({
  state,
  containerId: 'postbot-container',
  readers: {
    'default': defaultReader,
  },
});

export const getReaderData = parse;

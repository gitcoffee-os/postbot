import { initPostBot } from "~api"
import "~plugins";
import { handleMessage } from "./message.background";
import { createBackgroundListener } from '@gitcoffee/postbot-background';

export const config: PlasmoCSConfig = {}

console.log("Live now; make now always the most precious time. Now will never come again.")

initPostBot();

console.log('PostBot chrome.runtime.onMessage.addListener');
createBackgroundListener(handleMessage);

export { }

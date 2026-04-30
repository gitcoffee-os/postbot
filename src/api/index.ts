import { setApiConfig, user, authority } from '@gitcoffee/postbot-api';
import { getTrustedDomains, setTrustedDomains } from "~stores"
import { appId, getPostBotBaseUrl, getPostBotBaseApi, getDefaultTrustedDomain } from "~config/config";

setApiConfig({
  getBaseUrl: getPostBotBaseUrl,
  getBaseApi: getPostBotBaseApi,
  appId,
});

const intervalTime: number = 1000 * 30;

const initDefaultTrustedDomains = async() => {
  const trustedDomains = await getTrustedDomains();
  if (!trustedDomains) {
    await setTrustedDomains([
      {
        id: crypto.randomUUID(),
        domain: getDefaultTrustedDomain(),
      },
    ]);
  }
}

export const initPostBot = async() => {
  initDefaultTrustedDomains();
  await user.isLoginApi({});
  const mediaPlatformList = await authority.platform.listingApi({});
  startPostBot(intervalTime);
}

export const startPostBot = async(intervalTime: number) => {
  authority.client.updateApi({});
}

export { setApiConfig } from '@gitcoffee/postbot-api';
export { user, authority } from '@gitcoffee/postbot-api';

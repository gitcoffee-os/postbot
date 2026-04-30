import {
  t as coreT,
  localeManager,
  registerLanguageChangeCallback,
  registerProjectMessages,
  getCurrentLanguage
} from '@gitcoffee/i18n';
import { App, ref } from 'vue';
import enCommon from './en/common.json';
import zhCommon from './zh/common.json';

registerProjectMessages('postbot', 'en', {
  common: enCommon,
});

registerProjectMessages('postbot', 'zh', {
  common: zhCommon,
});

export const currentLanguage = ref(getCurrentLanguage());

registerLanguageChangeCallback((lang: string) => {
  currentLanguage.value = lang;
});

export const i18nPlugin = {
  install(app: App) {
    (app.config.globalProperties as any).$t = coreT;
    app.provide('$t', coreT);
  },
};

export const useTranslation = () => {
  const currentLanguageRef = currentLanguage;
  const translate = (key: string, params?: any): string => {
    currentLanguageRef.value;
    return coreT(key, params);
  };
  return translate;
};

export const useCurrentLanguage = () => {
  return currentLanguage;
};

export const setupI18n = (app: App) => {
  app.use(i18nPlugin);
};

export { registerLanguageChangeCallback, localeManager };
export * from '@gitcoffee/i18n';

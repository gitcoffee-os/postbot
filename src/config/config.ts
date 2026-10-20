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
interface PostbotConfig {
  baseUrl: string;
  baseApiPath: string;
  publishPath: string;
  defaultTrustedDomain: string;
  coverImageUrl: string;
  defaultAvatarUrl: string;
}

/**
 * 云端 Web 子域环境（子域名方案，与 desktop 的 EXMAY_WEB_ENV 对齐）：
 * - prod（默认）: postbot.exmay.com（公网生产，终端用户扩展构建用这个）
 * - dev         : postbot-dev.exmay.com（开发联调，`pnpm build:dev` 注入）
 * Plasmo 编译期静态替换 PLASMO_PUBLIC_* 环境变量；运行时无该变量时安全兜底 prod。
 * __POSTBOT_CONFIG__ 仍具最高覆盖优先级。
 */
type ExmayWebEnv = 'dev' | 'prod';

const resolveExmayWebEnv = (): ExmayWebEnv => {
  try {
    const env =
      typeof process !== 'undefined' && process.env
        ? process.env.PLASMO_PUBLIC_EXMAY_WEB_ENV
        : undefined;
    return env === 'dev' ? 'dev' : 'prod';
  } catch {
    return 'prod';
  }
};

const exmayWebHost = resolveExmayWebEnv() === 'dev' ? 'postbot-dev.exmay.com' : 'postbot.exmay.com';

const defaultConfig: PostbotConfig = {
  baseUrl: `https://${exmayWebHost}`,
  baseApiPath: '/exmay/authority/api',
  publishPath: '/exmay/postbot/media/publish',
  defaultTrustedDomain: 'exmay.com',
  coverImageUrl: 'https://cdn.exmay.com/exmay/exmay-app/static/images/postbot_home.png',
  defaultAvatarUrl: 'https://cdn.exmay.com/exmay/exmay-app/static/images/postbot_logo.png',
};

const loadConfig = (): PostbotConfig => {
  try {
    const envConfig = typeof __POSTBOT_CONFIG__ !== 'undefined' ? __POSTBOT_CONFIG__ : {};
    return { ...defaultConfig, ...envConfig };
  } catch {
    return defaultConfig;
  }
};

const config = loadConfig();

export const getPostBotBaseUrl = () => config.baseUrl;
export const getPostBotBaseApi = () => `${config.baseUrl}${config.baseApiPath}`;
export const getPublishPath = () => config.publishPath;
export const getDefaultTrustedDomain = () => config.defaultTrustedDomain;
export const getCoverImageUrl = () => config.coverImageUrl;
export const getDefaultAvatarUrl = () => config.defaultAvatarUrl;

export const appId = 'postbot';

declare const __POSTBOT_CONFIG__: Partial<PostbotConfig>;

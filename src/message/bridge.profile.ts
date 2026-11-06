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
import type { BridgeProfile } from '@gitcoffee-os/postbot-content-services';
import { appId, getPostBotBaseUrl } from '~config/config';

/**
 * PostBot 的窗口消息通道 profile。
 *
 * 这里刻意只做「类型导入」+ 字面量：background 也要用这份 profile，
 * 若从 content-services 运行时导入 `createBridgeProfile`，会把整个
 * content-services（含 content-adapter / Vue）打进 service worker。
 *
 * - `channel` = appId，页面消息带 `channel: 'postar'` 时本扩展整体不消费；
 * - `ownOrigins` = 本 App 的 Web 源，写操作（发布/同步内容/上传完成）只接受这里；
 *   PostBot 扩展同时服务 creator / mediastar 两个 Web 应用（它们复用同一套
 *   发布页与组件），因此这些域名也必须列入，否则升级后发布会全部被拦；
 * - `trustedOrigins` = 兄弟 App 源，只允许只读探测；
 * - `allowLegacyWrite` = 过渡期开关：扩展先发、Web 后发，旧页面仍可发布。
 *   Web 发版完成后改为 false（旧页面只剩“请升级”提示），即可彻底关闭 legacy 写。
 */
export const bridgeProfile = {
  channel: appId,
  ownOrigins: [
    getPostBotBaseUrl(),
    'https://postbot.exmay.com',
    'https://postbot-dev.exmay.com',
    'https://creator.exmay.com',
    'https://creator-dev.exmay.com',
    'https://mediastar.exmay.com',
    'https://mediastar-dev.exmay.com',
  ],
  trustedOrigins: ['https://postar.exmay.com', 'https://postar-dev.exmay.com'],
  allowLegacyWrite: true,
} satisfies BridgeProfile;

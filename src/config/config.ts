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
// export const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://postbot.exmay.com';
import { appSettings, saveExploreVersionSetting } from './setting';

export { saveExploreVersionSetting };
// Maintain backward compatibility
export const config = appSettings;

export const BASE_URL = 'https://postbot.exmay.com';
export const EXPLORE_BASE_URL = 'https://postar.exmay.com';

// Dynamic URL based on explore version setting
export const getPostBotBaseUrl = () => {
  return appSettings.value.exploreVersionEnabled ? EXPLORE_BASE_URL : BASE_URL;
};

export const getPostBotBaseApi = () => {
  return `${getPostBotBaseUrl()}/exmay/authority/api`;
};


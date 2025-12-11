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

import { reactive } from 'vue';

import { juejinMetaInfo } from './juejin.meta';
import { csdnMetaInfo } from './csdn.meta';
import { oschinaMetaInfo } from './oschina.meta';
import { cnblogsMetaInfo } from './cnblogs.meta';
import { segmentfaultMetaInfo } from './segmentfault.meta';
import { $51ctoMetaInfo } from './51cto.meta';

export const metaInfoList = reactive({
  juejin: juejinMetaInfo,
  csdn: csdnMetaInfo,
  oschina: oschinaMetaInfo,
  cnblogs: cnblogsMetaInfo,
  segmentfault: segmentfaultMetaInfo,
  $51cto: $51ctoMetaInfo,
});
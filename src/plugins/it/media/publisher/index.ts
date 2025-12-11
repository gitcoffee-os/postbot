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

import { juejinArticlePublisher } from './platform/article/juejin.publisher';
import { csdnArticlePublisher } from './platform/article/csdn.publisher';
import { oschinaArticlePublisher } from './platform/article/oschina.publisher';
import { cnblogsArticlePublisher } from './platform/article/cnblogs.publisher';
import { segmentfaultArticlePublisher } from "./platform/article/segmentfault.publisher";
import { $51ctoArticlePublisher } from "./platform/article/51cto.publisher";


export const publisher = {
  article: {
    juejin: juejinArticlePublisher,
    csdn: csdnArticlePublisher,
    oschina: oschinaArticlePublisher,
    cnblogs: cnblogsArticlePublisher,
    segmentfault: segmentfaultArticlePublisher,
    $51cto: $51ctoArticlePublisher,
  },
  moment: {
   
  }
};

export const getPublisher = () => {
  return publisher;
};

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
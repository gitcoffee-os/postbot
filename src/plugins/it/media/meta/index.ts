import { reactive } from 'vue';

import { juejinMetaInfo } from './juejin.meta';
import { csdnMetaInfo } from './csdn.meta';
import { oschinaMetaInfo } from './oschina.meta';

export const metaInfoList = reactive({
  juejin: juejinMetaInfo,
  csdn: csdnMetaInfo,
  oschina: oschinaMetaInfo,
});
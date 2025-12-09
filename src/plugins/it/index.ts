import { PluginType, PluginBase, PublisherConfig, PluginImplementation } from '../types';

// 导入插件的媒体模块（使用命名导入，因为这些模块没有默认导出）
import * as platformModule from './media/platform/index';
import * as metaModule from './media/meta/index';
import * as publisherModule from './media/publisher/index';

// 注意：PublisherMeta 不再需要，因为那是平台级别的配置
// 具体平台的元数据在 media/platform/index.ts 中定义

// 插件基础信息
const pluginBase: PluginBase = {
  code: 'it',
  name: 'IT技术平台同步插件',
  version: '1.0.0',
  type: PluginType.PUBLISHER,
  description: '包含掘金、CSDN等IT技术平台的发布支持',
  author: 'GitCoffee'
};

// 插件配置（插件级别的通用配置，具体平台的配置在 media/platform/index.ts 中定义）
const pluginConfig: PublisherConfig = {
  // 插件支持的内容类型（这个插件包含的平台支持哪些类型的内容）
  types: ['article'],

  // 注意：具体的平台元数据（platformName, site, homepage等）在各平台的 media/platform/index.ts 中定义
  // 这里不重复定义，因为一个插件可能包含多个不同的平台
};

// 插件实现
const pluginImplementation: PluginImplementation = {
  initialize: async () => {
    console.log('IT插件初始化完成');
  },

  destroy: async () => {
    console.log('IT插件销毁完成');
  },

  // 这里可以添加插件级别的通用方法
  getSupportedPlatforms: () => {
    return ['juejin', 'csdn', 'segmentfault']; // 未来支持的平台
  }
};

// 插件定义导出
export default {
  base: pluginBase,
  config: pluginConfig,
  implementation: pluginImplementation,
  modules: {
    platform: platformModule,
    meta: metaModule,
    publisher: publisherModule
  }
};
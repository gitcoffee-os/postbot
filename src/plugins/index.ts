import { pluginRegistry, setupInjection, PluginType, PluginBase, PublisherConfig, PluginImplementation } from '@gitcoffee/postbot-plugin-engine';
import { registerCnPlatforms, platformMetas as cnPlatformMetas, metaInfoList as cnMetaInfoList, publisher as cnPublisher } from '@gitcoffee/postbot-publisher-cn';
import { publishEngine } from '@gitcoffee/postbot-publish-engine';

import itPlugin from './it/index';

import { platformMetas, platforms } from '~media/platform';
import { metaInfoList } from '~media/meta';
import { publisher } from '~media/publisher/publisher.script';

const pluginList = [
  'it',
  'cn'
];

const pluginBaseCn: PluginBase = {
  code: 'cn',
  name: '国内平台发布器插件',
  version: '1.0.0',
  type: PluginType.PUBLISHER,
  description: '包含微信公众号、知乎、微博等国内平台的发布支持',
  author: 'GitCoffee'
};

const pluginConfigCn: PublisherConfig = {
  types: ['article', 'moment', 'video', 'audio'],
};

const pluginImplementationCn: PluginImplementation = {
  initialize: async () => {
    registerCnPlatforms(publishEngine);
  },
  getSupportedPlatforms: () => {
    return Object.keys(cnPlatformMetas);
  }
};

const cnPlugin = {
  base: pluginBaseCn,
  config: pluginConfigCn,
  implementation: pluginImplementationCn,
  modules: {
    platform: { platformMetas: cnPlatformMetas },
    meta: { metaInfoList: cnMetaInfoList },
    publisher: { publisher: cnPublisher }
  }
};

const pluginModulesMap: Record<string, any> = {
  it: itPlugin,
  cn: cnPlugin
};

const registerPlugins = () => {
  try {
    pluginList.forEach(pluginCode => {
      try {
        const plugin = pluginModulesMap[pluginCode];

        if (!plugin) {
          console.warn(`插件 ${pluginCode} 没有正确的映射`);
          return;
        }

        const { base, config, implementation, modules = {} } = plugin;

        pluginRegistry.register(base, config, implementation, modules);

      } catch (error) {
        console.error(`加载插件 ${pluginCode} 失败:`, error);
      }
    });

    console.log(`已加载 ${pluginRegistry.getAllPlugins().length} 个插件`);
  } catch (error) {
    console.error('插件系统初始化失败:', error);
  }
};

setupInjection({
  platformMetas,
  platforms,
  metaInfoList,
  publisher,
});

registerPlugins();

export { pluginRegistry } from '@gitcoffee/postbot-plugin-engine';
export { publishEngine } from '@gitcoffee/postbot-publish-engine';

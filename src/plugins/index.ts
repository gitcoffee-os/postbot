import { pluginRegistry, setupInjection, PluginType, PluginBase, PublisherConfig, PluginImplementation } from '@gitcoffee/postbot-plugin-engine';
import { registerCnPlatforms, platformMetas as cnPlatformMetas, metaInfoList as cnMetaInfoList, publisher as cnPublisher, publisherDebugConfigs as cnPublisherDebugConfigs } from '@gitcoffee/postbot-publisher-cn';
import { registerItPlatforms, platformMetas as itPlatformMetas, platforms as itPlatforms, metaInfoList as itMetaInfoList, publisher as itPublisher, publisherDebugConfigs as itPublisherDebugConfigs } from '@gitcoffee/postbot-publisher-it';
import { registerIndustryPlatforms, platformMetas as industryPlatformMetas, platforms as industryPlatforms, metaInfoList as industryMetaInfoList, publisher as industryPublisher, publisherDebugConfigs as industryPublisherDebugConfigs } from '@gitcoffee/postbot-publisher-industry';
import { publishEngine } from '@gitcoffee/postbot-publish-engine';

import { platformMetas, platforms } from '~media/platform';
import { metaInfoList } from '~media/meta';
import { publisher } from '~media/publisher/publisher.script';
import { debugPlugin } from './debug.plugin';
import { collectPublisherDebugConfigs } from './debug.plugin';
import { createAiAdapterPlugin } from '@gitcoffee/postbot-ai-adapter';
import type { DebugConfigLike } from '@gitcoffee/postbot-ai-adapter';
import { getAdapterRegistry } from '~ai-adapter/adapter.shared';

const pluginList = [
  'cn',
  'it',
  'industry',
  'debug'
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
    publisher: { publisher: cnPublisher, publisherDebugConfigs: cnPublisherDebugConfigs }
  }
};

const pluginBaseIt: PluginBase = {
  code: 'it',
  name: 'IT技术平台同步插件',
  version: '1.0.0',
  type: PluginType.PUBLISHER,
  description: '包含掘金、CSDN等IT技术平台的发布支持',
  author: 'GitCoffee'
};

const pluginConfigIt: PublisherConfig = {
  types: ['article'],
};

const pluginImplementationIt: PluginImplementation = {
  initialize: async () => {
    registerItPlatforms(publishEngine);
  },
  getSupportedPlatforms: () => {
    return Object.keys(itPlatformMetas);
  }
};

const itPlugin = {
  base: pluginBaseIt,
  config: pluginConfigIt,
  implementation: pluginImplementationIt,
  modules: {
    platform: { platformMetas: itPlatformMetas, platforms: itPlatforms },
    meta: { metaInfoList: itMetaInfoList },
    publisher: { publisher: itPublisher, publisherDebugConfigs: itPublisherDebugConfigs }
  }
};

const pluginBaseIndustry: PluginBase = {
  code: 'industry',
  name: '行业平台发布器插件',
  version: '1.0.0',
  type: PluginType.PUBLISHER,
  description: '包含闲鱼、汽车之家、雪球等行业平台的发布支持',
  author: 'GitCoffee'
};

const pluginConfigIndustry: PublisherConfig = {
  types: ['moment'],
};

const pluginImplementationIndustry: PluginImplementation = {
  initialize: async () => {
    registerIndustryPlatforms(publishEngine);
  },
  getSupportedPlatforms: () => {
    return Object.keys(industryPlatformMetas);
  }
};

const industryPlugin = {
  base: pluginBaseIndustry,
  config: pluginConfigIndustry,
  implementation: pluginImplementationIndustry,
  modules: {
    platform: { platformMetas: industryPlatformMetas, platforms: industryPlatforms },
    meta: { metaInfoList: industryMetaInfoList },
    publisher: { publisher: industryPublisher, publisherDebugConfigs: industryPublisherDebugConfigs }
  }
};

const pluginModulesMap: Record<string, any> = {
  it: itPlugin,
  cn: cnPlugin,
  industry: industryPlugin,
  debug: debugPlugin,
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

    // 发布器插件全部注册完成后，再用工厂构建 AI 自适应插件：
    // - collectPublisherDebugConfigs() 依赖已注册的 publisher 模块，必须在循环之后调用
    // - registry 注入共享单例，与 content/background/sidepanel 各上下文保持一致
    const aiAdapterPlugin = createAiAdapterPlugin({
      debugConfigs: collectPublisherDebugConfigs() as Record<string, DebugConfigLike>,
      registry: getAdapterRegistry(),
    });

    pluginRegistry.register(
      aiAdapterPlugin.base,
      aiAdapterPlugin.config,
      aiAdapterPlugin.implementation,
      aiAdapterPlugin.modules,
    );

    console.log(`已加载 ${pluginRegistry.getAllPlugins().length} 个插件`);

    // 所有发布器插件注册完成后，再挂载调试面板，确保能收集到全部 publisherDebugConfigs
    debugPlugin.implementation.setupDebugger?.();

    // AI 自适应插件：初始化注册中心并基于存量调试配置建立基线（幂等）
    aiAdapterPlugin.implementation.initialize?.().catch((error: any) => {
      console.error('AI 自适应插件初始化失败:', error);
    });
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

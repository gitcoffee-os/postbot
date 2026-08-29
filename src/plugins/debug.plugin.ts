import {
  pluginRegistry,
  PluginType,
} from '@gitcoffee/postbot-plugin-engine';
import type {
  PluginBase,
  DebugPluginConfig,
  PluginImplementation,
} from '@gitcoffee/postbot-plugin-engine';
import type { DebugConfig } from '@gitcoffee/postbot-publisher-debug';
import { setupDebugger } from '~debugger';

const pluginBase: PluginBase = {
  code: 'publisher-debug',
  name: '发布器调试插件',
  version: '1.0.0',
  type: PluginType.DEBUG,
  description: '在开发环境下为发布页面注入调试面板，测试选择器匹配情况',
  author: 'GitCoffee',
};

const pluginConfig: DebugPluginConfig = {
  autoShow: true,
};

function collectPublisherDebugConfigs(): Record<string, DebugConfig> {
  const configs: Record<string, DebugConfig> = {};

  pluginRegistry.getAllPlugins().forEach((plugin) => {
    const publisherModule = plugin.modules?.publisher;
    if (publisherModule?.publisherDebugConfigs) {
      Object.assign(configs, publisherModule.publisherDebugConfigs);
    }
  });

  return configs;
}

export { collectPublisherDebugConfigs };

function shouldActivateDebugger(): boolean {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  // 仅在内容脚本/页面上下文中初始化，避免在 service worker 或 popup 中挂载 DOM
  if (typeof document === 'undefined') {
    return false;
  }

  const isExtensionPage =
    typeof location !== 'undefined' &&
    location.href.startsWith('chrome-extension://');

  if (isExtensionPage) {
    return false;
  }

  return true;
}

const pluginImplementation: PluginImplementation = {
  initialize: async () => {
    if (!shouldActivateDebugger()) {
      return;
    }

    const configs = collectPublisherDebugConfigs();
    setupDebugger(configs);
  },
  setupDebugger: () => {
    if (!shouldActivateDebugger()) {
      return;
    }
    setupDebugger(collectPublisherDebugConfigs());
  },
};

export const debugPlugin = {
  base: pluginBase,
  config: pluginConfig,
  implementation: pluginImplementation,
  modules: {
    debug: {
      setupDebugger: pluginImplementation.setupDebugger,
    },
  },
};

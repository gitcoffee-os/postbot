import { pluginRegistry } from './registry';
import { PluginType } from './types';

import { platformMetas, platforms } from '~media/platform';
import { metaInfoList } from '~media/meta';
import { publisher } from '~media/publisher/publisher.script';

// 合并 platformMetas
export const mergePlatformMetas = (target: any, source: any) => {
  Object.assign(target, source);
};

// 合并 platforms
export const mergePlatforms = (target: any, source: any) => {
  Object.keys(source).forEach(type => {
    if (!target[type]) target[type] = {};
    Object.assign(target[type], source[type]);
  });
};

// 合并 metaInfoList
export const mergeMetaInfoList = (target: any, source: any) => {
  Object.assign(target, source);
};

// 合并 publishers
export const mergePublishers = (target: any, source: any) => {
  Object.keys(source).forEach(type => {
    if (!target[type]) target[type] = {};
    Object.assign(target[type], source[type]);
  });
};

// 注入插件平台信息到主流程
export const injectPluginPlatforms = () => {
  // 注入所有发布器插件的平台元数据到主流程
  const publisherPlugins = pluginRegistry.getPluginsByType(PluginType.PUBLISHER);
  console.log('injectPluginPlatforms - publisherPlugins:', publisherPlugins.length);
  publisherPlugins.forEach(plugin => {
    console.log('injectPluginPlatforms - processing plugin:', plugin.base.name);
    if (plugin.modules?.platform?.platformMetas) {
      console.log('injectPluginPlatforms - merging platformMetas:', Object.keys(plugin.modules.platform.platformMetas));
      mergePlatformMetas(platformMetas, plugin.modules.platform.platformMetas);
    }
    if (plugin.modules?.platform?.platforms) {
      console.log('injectPluginPlatforms - merging platforms:', Object.keys(plugin.modules.platform.platforms));
      mergePlatforms(platforms, plugin.modules.platform.platforms);
    }
    if (plugin.modules?.meta?.metaInfoList) {
      console.log('injectPluginPlatforms - merging metaInfoList:', Object.keys(plugin.modules.meta.metaInfoList));
      mergeMetaInfoList(metaInfoList, plugin.modules.meta.metaInfoList);
      console.log('injectPluginPlatforms - merged metaInfoList:', Object.keys(metaInfoList));
    }
    if (plugin.modules?.publisher?.publisher) {
      console.log('injectPluginPlatforms - merging publisher:', Object.keys(plugin.modules.publisher.publisher));
      mergePublishers(publisher, plugin.modules.publisher.publisher);
    }
  });
};

// 设置对象注入拦截器
export const setupInjection = () => {
  // 直接注入插件平台信息到主流程
  injectPluginPlatforms();
};
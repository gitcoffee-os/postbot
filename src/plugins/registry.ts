import { PluginType, RegisteredPlugin, PluginBase, PluginConfig, PluginImplementation } from './types';
import { injectPluginPlatforms } from './injector';

class PluginRegistry {
  private plugins = new Map<string, RegisteredPlugin>();

  register(base: PluginBase, config: PluginConfig, implementation: PluginImplementation, modules?: any) {
    const registeredPlugin: RegisteredPlugin = {
      base,
      config,
      implementation,
      modules
    };
    
    this.plugins.set(base.code, registeredPlugin);
    console.log(`插件 ${base.name} (${base.code}) 已注册，类型: ${base.type}`);
    
    // 如果是发布器插件，立即注入其平台信息
    if (base.type === PluginType.PUBLISHER) {
      injectPluginPlatforms();
    }
  }

  getAllPlugins(): RegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  getPlugin(code: string): RegisteredPlugin | undefined {
    return this.plugins.get(code);
  }

  getPluginsByType(type: PluginType): RegisteredPlugin[] {
    return this.getAllPlugins().filter(plugin => plugin.base.type === type);
  }

  hasPlugin(code: string): boolean {
    return this.plugins.has(code);
  }

  unregister(code: string): boolean {
    return this.plugins.delete(code);
  }
}

export const pluginRegistry = new PluginRegistry();
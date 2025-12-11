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
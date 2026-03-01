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

// 插件列表，添加新插件时只需要在这个数组中添加插件代码
const pluginList = [
  'it'
  // 在这里添加新的插件代码，例如：'ai', 'tool', 'en'
];

// 静态导入所有插件
import { pluginRegistry } from './registry';
import { setupInjection } from './injector';

// 导入IT插件
import itPlugin from './it/index';
// 导入国际平台插件
// import enPlugin from './en/index';

// 插件映射，只包含插件本身
const pluginModulesMap = {
  it: itPlugin
  // 在这里添加新的插件映射，例如：
  // ai: aiPlugin
  // en: enPlugin
};

// 注册所有插件
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
        
        // 注册插件
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

// 先初始化注入器
setupInjection();

// 然后注册所有插件
registerPlugins();

// 导出插件注册表供其他模块使用
export { pluginRegistry } from './registry';

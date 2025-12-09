// 插件列表，添加新插件时只需要在这个数组中添加插件代码
const pluginList = [
  'it'
  // 在这里添加新的插件代码，例如：'ai', 'tool'
];

// 静态导入所有插件
import { pluginRegistry } from './registry';
import { setupInjection } from './injector';

// 导入IT插件
import itPlugin from './it/index';

// 插件映射，只包含插件本身
const pluginModulesMap = {
  it: itPlugin
  // 在这里添加新的插件映射，例如：
  // ai: aiPlugin
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

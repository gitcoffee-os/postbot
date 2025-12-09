// 插件类型枚举
export enum PluginType {
    PUBLISHER = 'publisher',  // 发布器插件（如掘金、微信等）
    AI = 'ai',                // AI插件
    TOOL = 'tool',           // 工具插件
    EXTENSION = 'extension'  // 扩展插件
  }
  
  // 插件基础信息
  export interface PluginBase {
    code: string;
    name: string;
    version: string;
    type: PluginType;
    description?: string;
    author?: string;
  }
  
  // 发布器插件特有的元数据
  export interface PublisherMeta {
    platformName: string;
    site: string;
    homepage: string;
    mediaInfoUrl: string;
    faviconUrl: string;
    icon: string;
    tags: string[];
    sort: number;
    status: 'enabled' | 'disabled';
  }
  
// 发布器插件配置（插件级别，不包含具体平台元数据）
export interface PublisherConfig {
  types: ('article' | 'moment' | 'video' | 'podcast')[];
  // 注意：具体的平台元数据（platformName, site等）在各平台的配置文件中定义
  // publishUrls 等具体配置也在平台级别定义
}
  
  // AI插件配置
  export interface AIConfig {
    apiEndpoint: string;
    models: string[];
    capabilities: string[];
  }
  
  // 插件配置联合类型
  export type PluginConfig = PublisherConfig | AIConfig;
  
  // 插件实现接口
  export interface PluginImplementation {
    // 通用方法
    initialize?(): Promise<void>;
    destroy?(): Promise<void>;

    // 发布器插件特有方法
    getMediaInfo?(): Promise<any>;
    getPublishUrl?(type?: string): string;
    publisher?(data: any): Promise<void>;

    // AI插件特有方法
    generateContent?(prompt: string): Promise<string>;
    analyzeContent?(content: string): Promise<any>;

    // 插件级别的通用方法
    getSupportedPlatforms?(): string[];
  }
  
  // 已注册插件
  export interface RegisteredPlugin {
    base: PluginBase;
    config: PluginConfig;
    implementation: PluginImplementation;
    modules?: {
      platform?: any;
      meta?: any;
      publisher?: any;
    };
  }
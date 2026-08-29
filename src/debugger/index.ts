import { createDebugger } from '@gitcoffee/postbot-publisher-debug'
import type { DebugConfig, DebuggerInstance } from '@gitcoffee/postbot-publisher-debug'

interface PlatformPattern {
  match: (url: string) => boolean
  key: string
}

/**
 * URL -> publisherDebugConfigs 索引映射。
 * 只列出常用平台的主形态；同一域名存在多种形态时（如微信公众号同时有 article/moment），
 * 优先取最常用的一种。其余形态可在运行时由发布器自身注册到主世界注册表后被拉取。
 */
const PLATFORM_URL_PATTERNS: PlatformPattern[] = [
  { match: (url) => /mp\.weixin\.qq\.com/.test(url), key: 'article_weixin' },
  { match: (url) => /mp\.toutiao\.com/.test(url), key: 'article_toutiao' },
  { match: (url) => /creator\.xiaohongshu\.com/.test(url), key: 'article_xiaohongshu' },
  { match: (url) => /zhuanlan\.zhihu\.com/.test(url) || /www\.zhihu\.com\/creator/.test(url), key: 'article_zhihu' },
  { match: (url) => /card\.weibo\.com/.test(url) || /weibo\.com\/article/.test(url), key: 'article_weibo' },
  { match: (url) => /baijiahao\.baidu\.com/.test(url), key: 'article_baijiahao' },
  { match: (url) => /om\.qq\.com/.test(url), key: 'article_qq_om' },
  { match: (url) => /channels\.weixin\.qq\.com/.test(url), key: 'moment_weixin_channels' },
  { match: (url) => /creator\.douyin\.com/.test(url), key: 'video_douyin' },
  { match: (url) => /cp\.kuaishou\.com/.test(url), key: 'video_kuaishou' },
  { match: (url) => /member\.bilibili\.com/.test(url), key: 'article_bilibili' },
  { match: (url) => /www\.douban\.com\/note\/create/.test(url), key: 'article_douban' },
  { match: (url) => /www\.jianshu\.com\/writer/.test(url), key: 'article_jianshu' },
  { match: (url) => /wx\.zsxq\.com/.test(url) || /www\.zsxq\.com/.test(url), key: 'article_zsxq' },
  { match: (url) => /music\.163\.com\/st\/ncreator/.test(url), key: 'audio_music163' },
  { match: (url) => /mp\.tencentmusic\.com/.test(url), key: 'audio_qqmusic' },
  { match: (url) => /studio\.ximalaya\.com/.test(url), key: 'audio_ximalaya' },
  { match: (url) => /admin\.qingting\.fm/.test(url), key: 'audio_qingting' },
  { match: (url) => /nj\.lizhi\.fm/.test(url), key: 'audio_lizhi' },
  { match: (url) => /podcaster\.xiaoyuzhoufm\.com/.test(url), key: 'audio_xiaoyuzhou' },
  { match: (url) => /www\.goofish\.com\/publish/.test(url), key: 'moment_goofish' },
]

let debugInstance: DebuggerInstance | null = null

/** 按 URL 推断当前页面对应的调试配置键（article_xiaohongshu / video_douyin …），供适配器观测用 */
export function matchPlatformKey(url: string): string | null {
  for (const p of PLATFORM_URL_PATTERNS) {
    if (p.match(url)) {
      return p.key
    }
  }
  return null
}

export function setupDebugger(publisherDebugConfigs: Record<string, DebugConfig>): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  console.log('[PostBot Debugger] setupDebugger called on', window.location.href)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
      console.log('[PostBot Debugger] shortcut triggered')
      e.preventDefault()
      e.stopPropagation()
      toggleDebugPanel(publisherDebugConfigs)
    }
  })

  // 默认初始化调试按钮，用户点击后展开面板；无需记忆快捷键
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initDebugButton(publisherDebugConfigs)
  } else {
    document.addEventListener('DOMContentLoaded', () => initDebugButton(publisherDebugConfigs))
  }

  // DEV 环境下自动展开调试面板
  console.log('[PostBot Debugger] auto init in development')
  detectAndInitDebugger(publisherDebugConfigs)
}

async function initDebugButton(publisherDebugConfigs: Record<string, DebugConfig>): Promise<void> {
  console.log('[PostBot Debugger] initDebugButton start')
  try {
    const config = await resolveConfig(window.location.href, publisherDebugConfigs)
    console.log('[PostBot Debugger] initDebugButton config resolved:', config?.platform || 'none')
    const groups = config?.groups || [
      {
        name: '通用选择器',
        selectors: [
          { name: 'File Input', selector: 'input[type="file"]' },
          { name: 'Contenteditable', selector: 'div[contenteditable="true"]' },
          { name: 'All Buttons', selector: 'button' },
          { name: 'Text Input', selector: 'input[type="text"]' },
          { name: 'Textarea', selector: 'textarea' },
        ],
      },
    ]

    console.log('[PostBot Debugger] creating debugger with', groups.length, 'groups')
    debugInstance = createDebugger({
      platform: config?.platform || window.location.hostname,
      groups,
      autoShow: false,
    })
    console.log('[PostBot Debugger] debugger created:', !!debugInstance)
  } catch (err) {
    console.error('[PostBot Debugger] initDebugButton failed:', err)
  }
}

async function detectAndInitDebugger(publisherDebugConfigs: Record<string, DebugConfig>): Promise<void> {
  const config = await resolveConfig(window.location.href, publisherDebugConfigs)
  if (config) {
    setTimeout(() => {
      debugInstance = createDebugger({ ...config, autoShow: true })
    }, 1000)
  }
}

async function toggleDebugPanel(publisherDebugConfigs: Record<string, DebugConfig>): Promise<void> {
  console.log('[PostBot Debugger] toggleDebugPanel')
  if (debugInstance) {
    console.log('[PostBot Debugger] existing instance, toggle')
    debugInstance.toggle()
    return
  }

  const config = await resolveConfig(window.location.href, publisherDebugConfigs)
  console.log('[PostBot Debugger] resolved config:', config?.platform || 'none')
  const groups = config?.groups || [
    {
      name: '通用选择器',
      selectors: [
        { name: 'File Input', selector: 'input[type="file"]' },
        { name: 'Contenteditable', selector: 'div[contenteditable="true"]' },
        { name: 'All Buttons', selector: 'button' },
        { name: 'Text Input', selector: 'input[type="text"]' },
        { name: 'Textarea', selector: 'textarea' },
      ],
    },
  ]

  debugInstance = createDebugger({
    platform: config?.platform || window.location.hostname,
    groups,
    autoShow: true,
  })
}

/**
 * 解析当前页面应使用的调试配置：
 * 1. 根据 URL 从 publisherDebugConfigs 取静态配置（发布器源码中的选择器）。
 * 2. 通过 background 从页面主世界拉取运行时注册表，
 *    合并由 executeScriptsToTabs 在发布前注入的更精确/更多形态的配置。
 */
async function resolveConfig(
  url: string,
  publisherDebugConfigs: Record<string, DebugConfig>
): Promise<DebugConfig | null> {
  console.log('[PostBot Debugger] resolveConfig for', url)
  const staticConfig = getStaticConfig(url, publisherDebugConfigs)
  console.log('[PostBot Debugger] static config:', staticConfig?.platform || 'none')
  const runtimeConfigs = await fetchRuntimeConfigs()
  console.log('[PostBot Debugger] runtime configs keys:', Object.keys(runtimeConfigs))

  const matchedRuntime = Object.values(runtimeConfigs).find((cfg) =>
    staticConfig ? cfg.platform === staticConfig.platform : false
  )

  if (matchedRuntime) {
    return mergeConfigs(staticConfig, matchedRuntime)
  }

  return staticConfig
}

function getStaticConfig(
  url: string,
  publisherDebugConfigs: Record<string, DebugConfig>
): DebugConfig | null {
  for (const p of PLATFORM_URL_PATTERNS) {
    if (p.match(url)) {
      const config = publisherDebugConfigs[p.key]
      if (config) {
        return config
      }
    }
  }
  return null
}

/**
 * 从 Background 读取当前页面主世界的运行时注册表。
 * 发布器被注入前会通过 registerPublisherConfigOnPage 写入该表。
 * 内容脚本无法直接访问主世界 window，因此通过 background 中转 chrome.scripting.executeScript。
 */
async function fetchRuntimeConfigs(): Promise<Record<string, DebugConfig>> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      resolve({})
      return
    }

    chrome.runtime.sendMessage({ type: 'GET_RUNTIME_DEBUG_CONFIGS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[PostBot Debugger] fetch runtime configs failed:', chrome.runtime.lastError.message)
        resolve({})
        return
      }
      resolve((response as Record<string, DebugConfig>) || {})
    })
  })
}

/**
 * 合并静态与运行时配置：保留静态配置的元信息，把运行时 groups 追加到末尾。
 * 如果平台名一致则直接覆盖 groups，避免重复。
 */
function mergeConfigs(staticCfg: DebugConfig | null, runtimeCfg: DebugConfig): DebugConfig {
  if (!staticCfg) return runtimeCfg

  const staticGroupNames = new Set(staticCfg.groups.map((g) => g.name))
  const extraGroups = runtimeCfg.groups.filter((g) => !staticGroupNames.has(g.name))

  return {
    ...staticCfg,
    platform: runtimeCfg.platform || staticCfg.platform,
    groups: [...staticCfg.groups, ...extraGroups],
  }
}

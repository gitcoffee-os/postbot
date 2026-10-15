/**
 * Electron 扩展 API 桥接垫片（SW 侧，路径 D）。
 *
 * 背景：Electron 31 的扩展 API 对 chrome.tabs 仅支持 sendMessage/reload/
 * executeScript/query(partial)/update(partial)——tabs.create、tabs.onUpdated、
 * tabs.get、tabs.group、tabGroups、scripting.executeScript 均缺失或不完整，
 * 发布流程（createTabsForPlatforms → executeScriptsToTabs）无法执行。
 * MV3 Service Worker 不暴露为 webContents，无法用 executeJavaScript 注入补丁，
 * 因此垫片随扩展源码打包，在 SW 启动时安装，经 fetch('tabot://bridge/...')
 * 调回主进程（desktop-engine desktop-bridge.ts）完成真实开标签 / 脚本注入。
 *
 * 行为（仅当 chrome.tabs.create 缺失时安装，Chrome/真实扩展环境不生效）：
 * - tabs.create → 桥接开真实标签页（persist:mediastar，与发布页/扩展同 session），
 *   返回 {id: viewId}，viewId 为渲染进程确定性 viewId（mediastar-view-<tabId>）；
 * - tabs.get / tabs.onUpdated → 桥接查询 + 垫片侧轮询派发 status 事件；
 * - tabs.update / tabs.group / tabGroups.update → 桥接激活视图 / no-op；
 * - scripting.executeScript(func) → 桥接主进程在目标视图主世界执行（发布函数
 *   自包含；主世界无 chrome.runtime，主进程注入 fetchImage 垫片兜底）。
 *
 * 注意：chrome 命名空间属性可能是 accessor，strict 模式下普通赋值会抛 TypeError
 * 被外层 catch 吞掉，必须用 Object.defineProperty 安装（configurable+writable）。
 */

const BRIDGE_LOAD_TIMEOUT_MS = 120_000;
const BRIDGE_POLL_INTERVAL_MS = 400;
const BRIDGE_CALL_TIMEOUT_MS = 30_000;
const TAB_BRIDGE_REQ_PREFIX = '__tabbridge:req:';
const TAB_BRIDGE_RESP_PREFIX = '__tabbridge:resp:';

const isElectronEnv = (): boolean =>
  typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent ?? '');

/**
 * 桥接调用经 chrome.storage.local 中继到 content script 执行器
 * （contents/index.ts tabot://bridge 桥接执行器）：Electron 下 MV3 SW 的
 * fetch(tabot://) 被拦截、tabs.sendMessage 对 WebContentsView 不可达，
 * storage 读写是唯一已验证可靠的 SW↔CS 通道（AUTOPUBLISH_RESULT 同通道）。
 */
const bridgeCall = (op: string, payload?: unknown): Promise<any> =>
  new Promise((resolve, reject) => {
    let traceId: string;
    let watcher: any = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let settled = false;

    const cleanup = () => {
      settled = true;
      if (timer) clearTimeout(timer);
      if (watcher) chrome.storage.onChanged.removeListener(watcher);
      if (traceId) {
        chrome.storage.local.remove([`${TAB_BRIDGE_REQ_PREFIX}${traceId}`, `${TAB_BRIDGE_RESP_PREFIX}${traceId}`]);
      }
    };

    const finish = (fn: () => void) => {
      if (settled) return;
      cleanup();
      fn();
    };

    try {
      traceId = `sw-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      watcher = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
        if (areaName !== 'local') return;
        const change = changes[`${TAB_BRIDGE_RESP_PREFIX}${traceId}`];
        if (!change?.newValue) return;
        const resp = change.newValue as { ok?: boolean; data?: unknown; error?: string };
        if (resp?.ok) {
          finish(() => resolve(resp.data));
        } else {
          finish(() => reject(new Error(resp?.error || `[tabs-bridge] ${op} 桥接调用失败`)));
        }
      };
      chrome.storage.onChanged.addListener(watcher);

      timer = setTimeout(() => {
        finish(() => reject(new Error(`[tabs-bridge] ${op} 桥接超时（${BRIDGE_CALL_TIMEOUT_MS / 1000}s 无响应）`)));
      }, BRIDGE_CALL_TIMEOUT_MS);

      chrome.storage.local.set({ [`${TAB_BRIDGE_REQ_PREFIX}${traceId}`]: { op, payload, ts: Date.now() } }, () => {
        const err = chrome.runtime.lastError;
        if (err) finish(() => reject(new Error(`[tabs-bridge] 请求写入失败: ${err.message}`)));
      });
    } catch (err: any) {
      finish(() => reject(new Error(`[tabs-bridge] ${op} 中继失败: ${String(err?.message || err)}`)));
    }
  });

const defineShim = (host: any, key: string, value: unknown): void => {
  try {
    Object.defineProperty(host, key, {
      value,
      configurable: true,
      writable: true,
      enumerable: true,
    });
  } catch (err) {
    console.error(`[tabs-bridge] 安装 ${key} 失败:`, err);
  }
};

const toBridgeTab = (id: string, info: any): any => ({
  id,
  url: info?.url,
  title: info?.title,
  status: info?.status || 'loading',
  windowId: 1,
  index: 0,
  pinned: false,
  highlighted: false,
});

export const installElectronTabsShim = (): void => {
  try {
    if (typeof chrome === 'undefined' || !isElectronEnv()) return;

    const tabs: any = (chrome as any).tabs;
    if (!tabs) return;
    if (typeof tabs.create === 'function') return; // 原生可用（真实 Chrome），不干预

    // —— onUpdated 事件总线（垫片轮询驱动）——
    const updatedListeners: Array<(id: any, info: any, tab: any) => void> = [];
    const dispatchUpdated = (tabId: any, info: any, tab: any) =>
      updatedListeners.slice().forEach((fn) => {
        try {
          fn(tabId, info, tab);
        } catch {
          /* 监听器异常不中断轮询 */
        }
      });
    defineShim(tabs, 'onUpdated', {
      addListener: (fn: any) => updatedListeners.push(fn),
      removeListener: (fn: any) => {
        const i = updatedListeners.indexOf(fn);
        if (i >= 0) updatedListeners.splice(i, 1);
      },
      hasListener: (fn: any) => updatedListeners.includes(fn),
    });

    // —— 已创建 tab 的加载状态轮询（模拟 onUpdated {status: 'complete'}）——
    const tracked = new Map<string, { lastStatus: string; started: number; timer: ReturnType<typeof setTimeout> | null }>();
    const trackCreatedTab = (tabId: string) => {
      if (tracked.has(tabId)) return;
      const entry = { lastStatus: 'loading', started: Date.now(), timer: null as ReturnType<typeof setTimeout> | null };
      tracked.set(tabId, entry);
      const poll = async () => {
        try {
          const info = await bridgeCall('tabs/get', { id: tabId });
          const status = info?.status || 'loading';
          if (status !== entry.lastStatus) {
            entry.lastStatus = status;
            dispatchUpdated(tabId, { status }, toBridgeTab(tabId, info));
          }
        } catch {
          /* 视图尚未创建（渲染侧仍在建 view），继续轮询 */
        }
        const done = entry.lastStatus === 'complete';
        const expired = Date.now() - entry.started > BRIDGE_LOAD_TIMEOUT_MS;
        if (done || expired) {
          if (!done) {
            // 超时兜底放行：发布函数内部自带元素级等待
            entry.lastStatus = 'complete';
            dispatchUpdated(tabId, { status: 'complete' }, toBridgeTab(tabId, { status: 'complete' }));
          }
          tracked.delete(tabId);
          return;
        }
        entry.timer = setTimeout(poll, BRIDGE_POLL_INTERVAL_MS);
      };
      entry.timer = setTimeout(poll, 200);
    };

    // —— chrome.tabs.create ——
    defineShim(tabs, 'create', (props: any, cb?: (tab: any) => void) => {
      const p = bridgeCall('tabs/create', { url: props?.url, active: props?.active, title: props?.title })
        .then((r: any) => {
          const id = String(r?.id);
          trackCreatedTab(id);
          return toBridgeTab(id, r);
        });
      if (typeof cb === 'function') {
        p.then((tab: any) => cb(tab)).catch(() => {});
        return undefined as any;
      }
      return p;
    });

    // —— chrome.tabs.get ——
    defineShim(tabs, 'get', (id: any, cb?: (tab: any) => void) => {
      const p = bridgeCall('tabs/get', { id: String(id) }).then((info: any) => toBridgeTab(String(id), info));
      if (typeof cb === 'function') {
        p.then((tab: any) => cb(tab)).catch(() => {});
        return undefined as any;
      }
      return p;
    });

    // —— chrome.tabs.update（原生 partial 语义对 viewId 无效，强制桥接激活视图）——
    defineShim(tabs, 'update', (id: any, props: any, cb?: (tab?: any) => void) => {
      const p = bridgeCall('tabs/update', { id: String(id), ...(props || {}) }).then(() => toBridgeTab(String(id), props));
      if (typeof cb === 'function') {
        p.then((tab: any) => cb(tab)).catch(() => cb?.());
        return undefined as any;
      }
      return p;
    });

    // —— chrome.tabs.group / chrome.tabGroups（装饰性，no-op）——
    if (typeof tabs.group !== 'function') {
      defineShim(tabs, 'group', (opts: any, cb?: (groupId: number) => void) => {
        const groupId = 1;
        if (typeof cb === 'function') {
          setTimeout(() => cb(groupId), 0);
          return undefined as any;
        }
        return Promise.resolve(groupId);
      });
    }
    const anyChrome = chrome as any;
    if (!anyChrome.tabGroups) {
      defineShim(anyChrome, 'tabGroups', {
        update: ((groupId: any, props: any, cb?: (g: any) => void) => {
          const g = { id: 1, collapsed: false, ...(props || {}) };
          if (typeof cb === 'function') {
            setTimeout(() => cb(g), 0);
            return undefined as any;
          }
          return Promise.resolve(g);
        }) as any,
        onUpdated: { addListener: () => {}, removeListener: () => {}, hasListener: () => false },
        TAB_GROUP_ID_NONE: -1,
      });
    }

    // —— chrome.scripting.executeScript（func 形式 → 主进程主世界执行）——
    if (!anyChrome.scripting) {
      defineShim(anyChrome, 'scripting', {} as any);
    }
    defineShim(anyChrome.scripting, 'executeScript', async (details: any) => {
      if (!details?.func) {
        throw new Error('[tabs-bridge] executeScript 仅支持 func 形式');
      }
      const r = await bridgeCall('scripting/execute', {
        tabId: details.target?.tabId != null ? String(details.target.tabId) : undefined,
        func: details.func.toString(),
        args: details.args ?? [],
        world: details.world,
      });
      return r?.results ?? [];
    });

    console.log('[tabs-bridge] Electron 桥接垫片已安装（tabs.create/get/update/onUpdated/group/scripting → tabot://bridge）');
  } catch (err) {
    console.error('[tabs-bridge] 垫片安装失败:', err);
  }
};

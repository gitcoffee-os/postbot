/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

import {
  ADAPTER_ACTION,
  adapterApi,
  RepairEngine,
} from '@gitcoffee/postbot-ai-adapter';
import type {
  AdapterAction,
  AdapterMessage,
  DiagnosisReport,
  PageSchema,
  SelectorRedirect,
} from '@gitcoffee/postbot-ai-adapter';
import { initAdapterRegistry } from '~ai-adapter/adapter.shared';

let engine: RepairEngine | null = null;
let readyPromise: Promise<void> | null = null;

const getRepairEngine = async (): Promise<RepairEngine> => {
  if (!engine) {
    const registry = await initAdapterRegistry();
    engine = new RepairEngine({ registry });
  }
  return engine;
};

/** 转发光消息给所有内容脚本/扩展页面（自动应用/暂存等事件） */
const broadcastChage = (channel: AdapterAction, data: unknown): void => {
  adapterApi.broadcast(channel, data);
};

/** 把 DIAGNOSE 转发给"活动标签页"的内容脚本执行真实 DOM 检测 */
const diagnoseOnActiveTab = async (schemaKey?: string): Promise<DiagnosisReport[] | null> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tab.id!,
      {
        source: 'ai-adapter',
        action: ADAPTER_ACTION.DIAGNOSE,
        payload: { schemaKey },
      } satisfies AdapterMessage,
      (response) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(Array.isArray(response) ? (response as DiagnosisReport[]) : null);
      },
    );
  });
};

export async function initAdapterBackground(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    const registry = await initAdapterRegistry();
    engine = new RepairEngine({ registry });

    chrome.runtime.onMessage.addListener((request: AdapterMessage, _sender, sendResponse) => {
      if (!request || request.source !== 'ai-adapter' || !request.action) {
        return;
      }

      void (async () => {
        switch (request.action) {
          case ADAPTER_ACTION.GET_STATE: {
            sendResponse(registry.getViewById());
            break;
          }
          case ADAPTER_ACTION.RESYNC_BASELINES: {
            const result = await (await getRepairEngine()).syncFromBackend();
            broadcastChage(ADAPTER_ACTION.STATE_CHANGED, { synced: result });
            sendResponse(result);
            break;
          }
          case ADAPTER_ACTION.DIAGNOSE: {
            const { schemaKey } = (request.payload ?? {}) as { schemaKey?: string };
            const reports = await diagnoseOnActiveTab(schemaKey);
            sendResponse(reports);
            break;
          }
          case ADAPTER_ACTION.REPAIR: {
            const { report } = (request.payload ?? {}) as { report: DiagnosisReport };
            const outcome = await (await getRepairEngine()).handleReport(report);
            sendResponse(outcome);
            break;
          }
          case ADAPTER_ACTION.FINALIZE: {
            const { patchId, dryRun } = (request.payload ?? {}) as {
              patchId: string;
              dryRun: Record<string, { found: boolean; count: number }>;
            };
            const patch = await (await getRepairEngine()).finalize(patchId, dryRun);
            broadcastChage(ADAPTER_ACTION.STATE_CHANGED, {
              schemaKey: patch.schemaKey,
              status: patch.status,
            });
            sendResponse(patch);
            break;
          }
          case ADAPTER_ACTION.APPROVE: {
            const { patchId } = (request.payload ?? {}) as { patchId: string };
            const patch = await (await getRepairEngine()).approve(patchId);
            broadcastChage(ADAPTER_ACTION.STATE_CHANGED, {
              schemaKey: patch.schemaKey,
              status: patch.status,
            });
            sendResponse(patch);
            break;
          }
          case ADAPTER_ACTION.REJECT: {
            const { patchId } = (request.payload ?? {}) as { patchId: string };
            await (await getRepairEngine()).reject(patchId);
            sendResponse({ ok: true });
            break;
          }
          case ADAPTER_ACTION.ROLLBACK: {
            const { schemaKey, targetVersion } = (request.payload ?? {}) as {
              schemaKey: string;
              targetVersion?: number;
            };
            const schema: PageSchema | undefined = await (await getRepairEngine()).rollback(
              schemaKey,
              targetVersion,
            );
            broadcastChage(ADAPTER_ACTION.STATE_CHANGED, { schemaKey });
            sendResponse(schema);
            break;
          }
          case ADAPTER_ACTION.UPDATE_SETTINGS: {
            const { settings } = (request.payload ?? {}) as {
              settings: Partial<import('@gitcoffee/postbot-ai-adapter').AdapterSettings>;
            };
            const next = await registry.updateSettings(settings);
            broadcastChage(ADAPTER_ACTION.STATE_CHANGED, { settings: next });
            sendResponse(next);
            break;
          }
          case ADAPTER_ACTION.GET_REDIRECTS: {
            const { schemaKey } = (request.payload ?? {}) as { schemaKey: string };
            const redirects = registry.redirectsFor(schemaKey);
            const schema = registry.getEffectiveSchema(schemaKey);
            sendResponse({
              schemaKey,
              redirects,
              version: schema?.version ?? 1,
            } satisfies {
              schemaKey: string;
              redirects: SelectorRedirect[];
              version: number;
            });
            break;
          }
          default: {
            sendResponse({ ok: true, ignored: true });
          }
        }
      })().catch((e) => {
        console.error('[AiAdapter] background 处理失败', request.action, e);
        sendResponse({ ok: false, error: (e as Error).message });
      });

      return true;
    });

    console.log('[AiAdapter] 后台自适应模块已就绪');

    // 启动即从后端中心同步一次（best-effort，不影响主流程）
    try {
      const synced = await engine.syncFromBackend();
      if (synced.applied > 0) {
        console.log(`[AiAdapter] 后端中心同步：应用 ${synced.applied} 条补丁`, synced);
        broadcastChage(ADAPTER_ACTION.STATE_CHANGED, { synced });
      }
    } catch (e) {
      console.warn('[AiAdapter] 后端中心启动同步失败（可稍后重试）', e);
    }
  })();

  return readyPromise;
}
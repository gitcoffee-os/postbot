/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

import {
  ADAPTER_ACTION,
  adapterApi,
  DomWatcher,
  collectDomSnapshot,
  testFieldOnDom,
  buildDiagnosis,
} from '@gitcoffee/postbot-ai-adapter';
import type {
  AdapterMessage,
  AdapterPatch,
  DiagnosisReport,
  FieldHealth,
} from '@gitcoffee/postbot-ai-adapter';
import { matchPlatformKey } from '~debugger';
import { initAdapterRegistry } from '~ai-adapter/adapter.shared';
import { showAdapterToast } from '../components/adapter.toast';

let watcher: DomWatcher | null = null;
let currentKey: string = '';

/** 对补丁断裂字段在当前真实 DOM 上复测 */
const dryRunPatch = (patch: AdapterPatch): Record<string, { found: boolean; count: number }> => {
  const dryRun: Record<string, { found: boolean; count: number }> = {};
  for (const id of patch.brokenFields || []) {
    const field = patch.schema.fields.find((f) => f.id === id);
    if (!field) continue;
    const health: FieldHealth = testFieldOnDom(field);
    dryRun[id] = { found: health.found, count: health.count };
  }
  return dryRun;
};

/** 自动修复闭环：诊断 → 后台 AI → dry-run → 决策落地 */
const runAutoRepair = async (report: DiagnosisReport): Promise<void> => {
  try {
    const outcome = await adapterApi.repair(report);
    if (!outcome?.ok || !outcome.patchId || !outcome.patch) {
      console.warn('[AiAdapter] 修复被跳过或失败', outcome?.error);
      return;
    }

    const dryRun = dryRunPatch(outcome.patch);
    const patch = await adapterApi.finalize(outcome.patchId, dryRun);

    const recovered = Object.values(dryRun).filter((r) => r.found).length;
    if (patch.status === 'active') {
      showAdapterToast({
        type: 'success',
        title: 'AI 已自动修复发布页面',
        description: `${patch.schemaKey}：${recovered}/${patch.brokenFields.length} 个字段已恢复。请重试发布。`,
      });
    } else {
      showAdapterToast({
        type: 'info',
        title: 'AI 修复建议待确认',
        description: `${patch.schemaKey} 置信度 ${Math.round(patch.confidence * 100)}%，请在侧栏确认后重试发布。`,
      });
    }
  } catch (e) {
    console.error('[AiAdapter] 自动修复失败', e);
    showAdapterToast({ type: 'error', title: 'AI 修复失败', description: (e as Error).message });
  }
};

/** 当前页面匹配的 schemaKey 构建观测 schema 提供器（带 URL 命中 + 部分健康度过滤） */
const buildWatcher = async (): Promise<void> => {
  const key = matchPlatformKey(location.href);
  if (!key) {
    currentKey = '';
    return;
  }

  const registry = await initAdapterRegistry();
  currentKey = key;

  if (watcher) {
    watcher.stop();
    watcher = null;
  }

  watcher = new DomWatcher({
    label: key,
    schemasProvider: () => {
      const schema = registry.getEffectiveSchema(key);
      return schema ? [schema] : [];
    },
    brokenCooldown: 90_000,
  });

  watcher.on('broken', (report: DiagnosisReport) => {
    void runAutoRepair(report);
  });

  watcher.start();
  console.log(`[AiAdapter] 已开始观测 ${key}`);
};

export async function initAdapterService(): Promise<void> {
  await initAdapterRegistry();
  await buildWatcher();

  chrome.runtime.onMessage.addListener((request: AdapterMessage, _sender, sendResponse) => {
    if (!request || request.source !== 'ai-adapter') return;

    if (request.action === ADAPTER_ACTION.DIAGNOSE) {
      void (async () => {
        const { schemaKey } = (request.payload ?? {}) as { schemaKey?: string };
        const reports: DiagnosisReport[] = [];
        const registry = await initAdapterRegistry();
        const schema = schemaKey
          ? registry.getEffectiveSchema(schemaKey)
          : currentKey
            ? registry.getEffectiveSchema(currentKey)
            : undefined;

        if (schema) {
          reports.push(await buildDiagnosis(schema, collectDomSnapshot()));
        }
        sendResponse(reports);
      })();
      return true;
    }

    if (request.action === ADAPTER_ACTION.STATE_CHANGED) {
      void buildWatcher();
    }
  });
}

export { currentKey };
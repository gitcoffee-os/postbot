/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

import { SchemaRegistry, buildSchemaFromDebugConfig } from '@gitcoffee/postbot-ai-adapter';
import type { DebugConfigLike } from '@gitcoffee/postbot-ai-adapter';

let registry: SchemaRegistry | null = null;

/** background / content / sidepanel 各自上下文内的懒单例（统一经 chrome.storage 同步） */
export const getAdapterRegistry = (): SchemaRegistry => {
  if (!registry) {
    registry = new SchemaRegistry();
  }
  return registry;
};

/** 初始化注册中心（幂等） */
export const initAdapterRegistry = async (): Promise<SchemaRegistry> => {
  const reg = getAdapterRegistry();
  if (reg.readyFlag) return reg;
  await reg.init();
  return reg;
};

/** 用存量 DebugConfig 建立基线（幂等，不覆盖已有 schema） */
export const seedAdapterBaselines = async (
  configs: Record<string, DebugConfigLike>,
): Promise<SchemaRegistry> => {
  const reg = await initAdapterRegistry();
  await reg.ensureBaselines(configs, buildSchemaFromDebugConfig);
  return reg;
};

export type { DebugConfigLike };
<template>
    <div style="padding: 4px 12px 20px;">
      <a-card size="small" :bordered="false" style="margin-bottom: 12px;">
        <template #title>
          <span style="font-size: 13px;">AI 自适应修复</span>
        </template>
        <template #extra>
          <a-tag :color="settings.enabled ? 'green' : 'red'" style="cursor: pointer" @click="onToggleEnabled">
            {{ settings.enabled ? '已启用' : '已停用' }}
          </a-tag>
        </template>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="adp-label">自动应用（高置信）</span>
            <a-switch :checked="settings.autoApprove" size="small" @change="onSetting('autoApprove', $event)" />
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="adp-label">AI 调用通道</span>
            <a-select
              :value="settings.aiEndpoint"
              size="small"
              style="width: 120px;"
              :options="endpointOptions"
              @change="onSetting('aiEndpoint', $event)"
            />
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="adp-label">自动应用阈值 {{ Math.round((settings.confidenceThreshold ?? 0.85) * 100) }}%</span>
            <a-slider
              style="width: 130px;"
              :min="50"
              :max="100"
              :value="Math.round((settings.confidenceThreshold ?? 0.85) * 100)"
              @change="(v) => onSetting('confidenceThreshold', v / 100)"
            />
          </div>
        </div>
      </a-card>

      <a-card size="small" :bordered="false" style="margin-bottom: 12px;">
        <template #title>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px;">平台适配状态</span>
            <a-space size="small">
              <a-button size="small" :loading="syncing" @click="onSyncBackend">
                同步中心
              </a-button>
              <a-button size="small" type="primary" ghost :loading="diagnosing" @click="onDiagnoseActiveTab">
                诊断当前页
              </a-button>
            </a-space>
          </div>
        </template>
        <div v-if="platformList.length === 0" style="color: #8c8c8c; font-size: 12px; padding: 8px 0;">
          暂无已建立基线的平台
        </div>
        <div v-else style="display: flex; flex-direction: column; gap: 8px;">
          <div
            v-for="item in platformList"
            :key="item.schemaKey"
            style="display: flex; align-items: center; gap: 8px; font-size: 12px;"
          >
            <a-tag
              :color="item.healthHealthy === false ? 'red' : 'green'"
              style="width: 110px; text-align: center; margin-inline-end: 0;"
            >
              {{ item.platform }} v{{ item.version }}
            </a-tag>
            <span style="color: #8c8c8c; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ item.brokenCount ? `断裂 ${item.brokenCount} 个字段` : '字段健康' }}
            </span>
            <a-button size="small" @click="onDiagnose(item.schemaKey)">诊断</a-button>
            <a-button size="small" danger :disabled="item.version <= 1" @click="onRollback(item.schemaKey)">
              回滚
            </a-button>
          </div>
        </div>
      </a-card>

      <a-card size="small" :bordered="false">
        <template #title>
          <span style="font-size: 13px;">AI 修复补丁历史</span>
        </template>
        <div v-if="patches.length === 0" style="color: #8c8c8c; font-size: 12px; padding: 8px 0;">
          暂无修复补丁
        </div>
        <div v-else style="display: flex; flex-direction: column; gap: 8px;">
          <div
            v-for="patch in patches"
            :key="patch.id"
            style="border: 1px solid #f0f0f0; border-radius: 6px; padding: 8px;"
          >
            <div style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
              <a-tag :color="statusColor(patch.status)">{{ statusText(patch.status) }}</a-tag>
              <span style="font-weight: 600;">{{ patch.schemaKey }}</span>
              <span style="color: #8c8c8c;">v{{ patch.schema.version }}</span>
              <span style="color: #8c8c8c;">置信 {{ Math.round(patch.confidence * 100) }}%</span>
            </div>
            <div style="font-size: 12px; color: #595959; margin-top: 4px;">
              {{ patch.rationale || 'AI 修复建议' }}
            </div>
            <div v-if="patch.status === 'stage'" style="margin-top: 8px; display: flex; gap: 8px;">
              <a-button size="small" type="primary" @click="onApprove(patch.id)">确认应用</a-button>
              <a-button size="small" @click="onReject(patch.id)">拒绝</a-button>
            </div>
            <div v-if="patch.dryRun && Object.keys(patch.dryRun).length" style="font-size: 11px; color: #8c8c8c; margin-top: 4px;">
              复测：{{ dryRunSummary(patch.dryRun) }}
            </div>
          </div>
        </div>
      </a-card>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { message } from 'ant-design-vue';
import { ADAPTER_ACTION, adapterApi } from '@gitcoffee/postbot-ai-adapter';
import type { AdapterPatch, AdapterSettings, AdapterStateView } from '@gitcoffee/postbot-ai-adapter';

const settings = ref<AdapterSettings>({ enabled: true, autoApprove: false, aiEndpoint: 'backend' });
const state = ref<AdapterStateView | null>(null);
const diagnosing = ref(false);
const syncing = ref(false);

const endpointOptions = [
  { label: '后端中心', value: 'backend' },
  { label: '直连 AI', value: 'direct' },
];

const platformList = computed(() => {
  const view = state.value;
  if (!view) return [];
  return Object.keys(view.schemas).map((key) => {
    const schema = view.schemas[key];
    const diagnosis = view.lastDiagnosis?.[key];
    const brokenCount = diagnosis?.brokenFields?.length ?? 0;
    return {
      schemaKey: key,
      platform: schema.platform,
      version: schema.version,
      brokenCount,
      healthHealthy: diagnosis ? brokenCount === 0 : null,
    };
  });
});

const patches = computed(() => state.value?.patches ?? []);

const refresh = async () => {
  try {
    state.value = await adapterApi.getState();
    settings.value = state.value.settings;
  } catch (e) {
    console.warn('[AiAdapter] 拉取状态失败', e);
  }
};

const onSetting = async (key: keyof AdapterSettings, value: any) => {
  try {
    settings.value = await adapterApi.updateSettings({ [key]: value } as Partial<AdapterSettings>);
  } catch (e) {
    console.error(e);
    message.error('设置更新失败');
  }
};

const onToggleEnabled = async () => {
  await onSetting('enabled', !settings.value.enabled);
};

const onDiagnoseActiveTab = async () => {
  diagnosing.value = true;
  try {
    const reports = await adapterApi.diagnose(undefined);
    if (reports?.length) {
      message.success(`当前页已诊断，断裂字段 ${reports[0].brokenFields.length} 个`);
    } else {
      message.info('当前页未识别到已录入的平台页面');
    }
    await refresh();
  } finally {
    diagnosing.value = false;
  }
};

const onSyncBackend = async () => {
  syncing.value = true;
  try {
    const result = await adapterApi.resyncBaselines();
    if (result?.applied) {
      message.success(`中心同步完成：应用 ${result.applied} 条补丁`);
    } else if (result?.applied === 0) {
      message.info(result?.error ? `同步未生效：${result.error}` : '中心已最新，无需应用');
    }
    await refresh();
  } catch (e) {
    message.error('中心同步失败');
    console.warn('[AiAdapter] 中心同步失败', e);
  } finally {
    syncing.value = false;
  }
};

const onDiagnose = async (schemaKey: string) => {
  await adapterApi.diagnose(schemaKey);
  message.success(`已诊断 ${schemaKey}`);
  await refresh();
};

const onRollback = async (schemaKey: string) => {
  await adapterApi.rollback(schemaKey);
  message.success(`${schemaKey} 已回滚到 v1 基线`);
  await refresh();
};

const onApprove = async (patchId: string) => {
  await adapterApi.approve(patchId);
  message.success('补丁已确认应用');
  await refresh();
};

const onReject = async (patchId: string) => {
  await adapterApi.reject(patchId);
  message.info('补丁已拒绝');
  await refresh();
};

const statusText = (s: AdapterPatch['status']) =>
  ({ active: '已应用', stage: '待确认', draft: '草稿', disabled: '已停用' }[s] ?? s);

const statusColor = (s: AdapterPatch['status']) =>
  ({ active: 'green', stage: 'orange', draft: 'blue', disabled: 'default' }[s] ?? 'default');

const dryRunSummary = (dryRun: Record<string, { found: boolean; count: number }>) => {
  const entries = Object.entries(dryRun);
  const ok = entries.filter(([, v]) => v.found).length;
  return `${ok}/${entries.length} 命中`;
};

const listener = (msg: any) => {
  if (msg?.source === 'ai-adapter' && msg.action === ADAPTER_ACTION.STATE_CHANGED) {
    void refresh();
  }
};

onMounted(() => {
  void refresh();
  chrome.runtime.onMessage.addListener(listener);
});

onBeforeUnmount(() => {
  chrome.runtime.onMessage.removeListener(listener);
});
</script>

<style scoped>
.adp-label {
  font-size: 12px;
  color: #595959;
}
</style>
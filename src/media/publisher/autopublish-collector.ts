import { POSTBOT_ACTION } from '@gitcoffee/postbot-actions';

/**
 * 自动发布终态收集器（路径 D，M3）。
 *
 * 仅在「自动发布」场景激活：发布请求（PUBLISH_NOW）携带 jobId 且来自发布页时，
 * background 开始收集各平台标签的发布结果；全部平台落定（或超时）后，
 * 汇总为 AUTOPUBLISH_RESULT 经 content script 回传发布页，
 * 由桌面注入的监听脚本捕获 → renderer → desktop:autopublish:progress → engine result_report。
 *
 * 汇总策略（防重复发布）：
 * - 全部 SUCCESS → SUCCESS
 * - 部分 SUCCESS → FAILED（不可重试，failureReason=PARTIAL_PUBLISH；避免重试重发已成功平台）
 * - 无 SUCCESS → FAILED_RETRYABLE（可重试，engine 退避后重排）
 */

export interface PlatformOutcome {
  platformCode: string;
  platformName?: string;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  publishedUrl?: string;
  screenshotUrl?: string;
  failureReason?: string;
  errorMsg?: string;
}

export interface AutopublishRunResult {
  jobId: string | number;
  status: 'SUCCESS' | 'FAILED_RETRYABLE' | 'FAILED';
  outcomes: PlatformOutcome[];
  /** 首个成功平台的内容链接（回填 engine publishedUrl） */
  publishedUrl?: string;
  screenshotUrl?: string;
  failureReason?: string;
  errorMsg?: string;
}

/** 单次运行超时：超时后缺失的平台按 TIMEOUT 落定并强制交付 */
const RUN_TIMEOUT_MS = 15 * 60 * 1000;

interface ActiveRun {
  jobId: string | number;
  sourceTabId?: number;
  expected: Set<string>;
  outcomes: Map<string, PlatformOutcome>;
  timer: ReturnType<typeof setTimeout>;
  delivered: boolean;
}

let activeRun: ActiveRun | null = null;

/** 开始收集（仅自动发布；data.jobId 存在时由 windowPublish 调用） */
export const beginAutopublishRun = (
  jobId: string | number,
  sourceTabId: number | undefined,
  platformCodes: string[],
): void => {
  endAutopublishRun(); // 防御：上一轮未交付先冲掉
  activeRun = {
    jobId,
    sourceTabId,
    expected: new Set(platformCodes || []),
    outcomes: new Map(),
    timer: setTimeout(() => {
      deliverRun('timeout');
    }, RUN_TIMEOUT_MS),
    delivered: false,
  };
  console.log('[autopublish-collector] 开始收集:', { jobId, sourceTabId, platforms: [...(platformCodes || [])] });
};

/** 记录单平台结果；全部落定时立即交付 */
export const recordAutopublishOutcome = (outcome: PlatformOutcome): void => {
  const run = activeRun;
  if (!run || run.delivered) return;
  run.outcomes.set(outcome.platformCode, outcome);
  console.log('[autopublish-collector] 平台结果:', outcome);
  const settled = [...run.expected].every((code) => run.outcomes.has(code));
  if (settled) {
    deliverRun('settled');
  }
};

/** 运行是否进行中（publisher.script 等无需感知细节，直接调用 record 即可，内部已守卫） */
export const isAutopublishCollecting = (): boolean => !!activeRun && !activeRun.delivered;

/** 同一 job 的收集轮是否进行中：陈旧发布页（上轮 180s 超时未关闭）迟到的 publishNow 会
 *  重复触发 windowPublish → beginAutopublishRun 冲掉进行中的轮 + 平台 tab 二次/三次注入，
 *  发布器并行三实例同抢同一文件上传入口（e2e 实证）。windowPublish 侧据此守卫。 */
export const isAutopublishRunActiveFor = (jobId: string | number): boolean =>
  !!activeRun && !activeRun.delivered && String(activeRun.jobId) === String(jobId);

/** 整轮失败（如 windowPublish 同步异常、开标签失败）：全部平台按 FAILED 落定并立即交付 */
export const failAutopublishRun = (failureReason: string, errorMsg: string): void => {
  const run = activeRun;
  if (!run || run.delivered) return;
  for (const code of run.expected) {
    if (!run.outcomes.has(code)) {
      run.outcomes.set(code, { platformCode: code, status: 'FAILED', failureReason, errorMsg });
    }
  }
  deliverRun('settled');
};

const deliverRun = (reason: 'settled' | 'timeout'): void => {
  const run = activeRun;
  if (!run || run.delivered) return;
  run.delivered = true;
  clearTimeout(run.timer);

  const outcomes: PlatformOutcome[] = [];
  for (const code of run.expected) {
    outcomes.push(
      run.outcomes.get(code) || {
        platformCode: code,
        status: 'TIMEOUT',
        failureReason: 'TIMEOUT',
        errorMsg: `平台发布超时（${Math.round(RUN_TIMEOUT_MS / 60000)} 分钟未回传结果）`,
      },
    );
  }
  // 预期外的平台结果也一并带上（如 publishUrls 拆分多标签）
  for (const [code, outcome] of run.outcomes) {
    if (!run.expected.has(code)) outcomes.push(outcome);
  }

  const successOutcomes = outcomes.filter((o) => o.status === 'SUCCESS');
  let status: AutopublishRunResult['status'];
  let failureReason: string | undefined;
  let errorMsg: string | undefined;
  if (outcomes.length === 0) {
    // 防御：无有效平台（platformCodes 为空/全部被禁用）不得判成功
    status = 'FAILED';
    failureReason = 'NO_PLATFORM';
    errorMsg = '无有效发布平台';
  } else if (successOutcomes.length === outcomes.length) {
    status = 'SUCCESS';
  } else if (successOutcomes.length > 0) {
    status = 'FAILED';
    failureReason = 'PARTIAL_PUBLISH';
    errorMsg = `部分平台发布失败: ${outcomes.filter((o) => o.status !== 'SUCCESS').map((o) => o.platformCode).join(',')}`;
  } else {
    status = 'FAILED_RETRYABLE';
    failureReason = outcomes.find((o) => o.failureReason)?.failureReason || (reason === 'timeout' ? 'TIMEOUT' : 'PUBLISH_FAILED');
    errorMsg = outcomes.find((o) => o.errorMsg)?.errorMsg || '全部平台发布失败';
  }

  const result: AutopublishRunResult = {
    jobId: run.jobId,
    status,
    outcomes,
    publishedUrl: successOutcomes.find((o) => o.publishedUrl)?.publishedUrl,
    screenshotUrl: successOutcomes.find((o) => o.screenshotUrl)?.screenshotUrl,
    failureReason,
    errorMsg,
  };
  console.log('[autopublish-collector] 交付终态:', JSON.stringify(result).slice(0, 500));

  // 存储桥（路径 D 关键通道）：发布页运行在桌面 WebContentsView 中，非真实 chrome.tabs.Tab，
  // tabs.sendMessage/query 在 Electron 下均不可达 → 终态落 chrome.storage.local，
  // 由 content script 经 storage.onChanged 中继回发布页 window。Chrome 中与 tabs 通道并存，双保险。
  try {
    const stored = { ...result, deliveredAt: Date.now() };
    chrome.storage.local.set({
      'autopublish-result:latest': stored,
      [`autopublish-result:${run.jobId}`]: stored,
    });
  } catch (err) {
    console.warn('[autopublish-collector] 存储桥写入失败:', err);
  }

  const sendResultToTab = (tabId: number, onNoReceiver?: () => void): void => {
    try {
      chrome.tabs.sendMessage(
        tabId,
        { type: 'request', action: POSTBOT_ACTION.AUTOPUBLISH_RESULT, data: result },
        () => {
          // 无接收方（页面已关闭/标签映射失效）时走兜底重试；其他失败忽略（engine 有租约/超时兜底）
          const err = chrome.runtime.lastError;
          if (err && onNoReceiver) onNoReceiver();
        },
      );
    } catch (err) {
      console.warn('[autopublish-collector] 终态回传失败:', err);
      if (onNoReceiver) onNoReceiver();
    }
  };

  // 按发布页 URL 找回传目标（Electron 兼容：background 消息的 sender.tab 可能缺失/失效）
  const queryFallback = (): void => {
    try {
      chrome.tabs.query({ url: '*://*/exmay/postbot/media/publish*' }, (tabs) => {
        const targetId = tabs?.[0]?.id;
        if (targetId !== undefined && targetId !== run.sourceTabId) {
          sendResultToTab(targetId);
        } else {
          console.warn('[autopublish-collector] 无可用发布页标签，终态仅留痕');
        }
      });
    } catch (err) {
      console.warn('[autopublish-collector] 终态回传失败:', err);
    }
  };

  if (run.sourceTabId !== undefined) {
    sendResultToTab(run.sourceTabId, queryFallback);
  } else {
    queryFallback();
  }
  activeRun = null;
};

/** 冲掉未交付的收集（登出/扩展重载等场景） */
export const endAutopublishRun = (): void => {
  if (activeRun) {
    clearTimeout(activeRun.timer);
    activeRun = null;
  }
};

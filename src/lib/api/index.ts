// Unified API client — re-exports all types for backward compatibility.

export { API_BASE } from "./client";
export * from "../types";

import { request, buildOptionSnapshotQuery, API_BASE } from "./client";

import type {
  // common
  MarketDataSource,
  StrategyName,
  ScannerMode,
  ForecastContextType,
  ForecastMode,
  ForecastSourceType,
  EventStatus,
  ResearchTaskType,
  ResearchTaskTargetType,
  // market-data
  OptionChainSnapshot,
  VolTermStructureResponse,
  VolSurfaceResponse,
  NewsItem,
  ActivitySignalRecord,
  // provider
  ProviderHealthRecord,
  OptionsActivityProviderContractRecord,
  FundamentalsProviderContractRecord,
  SentimentProviderContractRecord,
  ProviderDriftReportRecord,
  LLMTelemetryReport,
  LLMCostReport,
  BackgroundJobStatusRecord,
  BackgroundJobEventRecord,
  BackgroundJobTriggerResponse,
  RiskProfile,
  LLMPolicy,
  // portfolio
  PortfolioAccountRecord,
  PortfolioPositionRecord,
  PortfolioExposureRecord,
  PortfolioActivityImportHistoryItemRecord,
  PortfolioActivityImportLineageRecord,
  PortfolioActivityImportRollbackResultRecord,
  PortfolioActivityImportPreviewRecord,
  PortfolioActivityImportResultRecord,
  ExpirationCalendarItemRecord,
  RegimeDecomposition,
  EventDecomposition,
  StrategyConcentration,
  WhatIfOverlayResult,
  CorrelationMatrixData,
  // watchlist
  WatchlistRecord,
  WatchlistSignalPayloadRecord,
  WatchlistExportRecord,
  StrategyScreenRecord,
  StrategyScreenRunRecord,
  FactorSnapshotRecord,
  RegimeSnapshotRecord,
  // events
  EventCalendarItemRecord,
  EventBriefSummaryRecord,
  EventBriefRecord,
  // research
  ResearchNotebookRecord,
  ResearchNotebookDetailRecord,
  ResearchBriefSummaryRecord,
  ResearchBriefRecord,
  ResearchTaskRecord,
  ResearchTaskEventRecord,
  ResearchSourceRecord,
  ResearchChunkRecord,
  // forecast
  ForecastSetRecord,
  CalibrationScorecardRecord,
  TradeReviewRecord,
  ForecastProfileRecord,
  // alerts
  AlertRuleRecord,
  AlertRuleType,
  AlertCondition,
  AlertEventRecord,
  // backtest
  BacktestRunRecord,
  BacktestConfig,
  BacktestRunResultsRecord,
  RLDatasetRecord,
  RLTrainingRunRecord,
  RLModelArtifactRecord,
  RLSignalRecord,
  ArchiveCoverageRecord,
  ArchiveImportJobRecord,
  // analysis
  AnalysisRunResponse,
  AnalysisRunDetail,
  PaperTradeCreateRequest,
  PaperTradeRecord,
} from "../types";

import type {
  StrategyEvaluation,
  StrategyEvaluationRequest,
} from "../types";

export const api = {
  // ── Settings / Watchlist ──
  getWatchlist: () => request<{ symbols: string[] }>("/settings/watchlist"),

  // ── Provider Health ──
  getProviderHealth: () =>
    request<{ providers: ProviderHealthRecord[] }>("/providers/health"),
  getProviderOptionsActivityContract: (symbol: string) =>
    request<OptionsActivityProviderContractRecord>(
      `/providers/options-activity/${symbol}`,
    ),
  getProviderFundamentalsContract: (symbol: string) =>
    request<FundamentalsProviderContractRecord>(
      `/providers/fundamentals/${symbol}`,
    ),
  getProviderSentimentContract: (symbol: string) =>
    request<SentimentProviderContractRecord>(
      `/providers/sentiment/${symbol}`,
    ),
  getProviderDrift: (symbol: string) =>
    request<ProviderDriftReportRecord>(`/providers/drift/${symbol}`),
  getProviderDriftHistory: (symbol: string, days = 30) =>
    request<ProviderDriftReportRecord[]>(
      `/providers/drift/${symbol}/history?days=${days}`,
    ),
  getLLMTelemetry: (hours = 24) =>
    request<LLMTelemetryReport>(`/providers/llm-telemetry?hours=${hours}`),
  getBackgroundJobs: () =>
    request<{
      jobs: BackgroundJobStatusRecord[];
      recent_events: BackgroundJobEventRecord[];
    }>("/providers/background-jobs"),
  triggerBackgroundJob: (jobName: string) =>
    request<BackgroundJobTriggerResponse>(
      `/providers/background-jobs/${jobName}/run`,
      { method: "POST" },
    ),

  // ── Options / Market Data ──
  getChain: (
    symbol: string,
    forceRefresh = false,
    snapshotId?: string,
    source?: MarketDataSource,
  ) =>
    request<OptionChainSnapshot>(
      `/options/chain/${symbol}${buildOptionSnapshotQuery({
        forceRefresh,
        snapshotId,
        source,
      })}`,
    ),
  captureSnapshot: (symbol: string) =>
    request<OptionChainSnapshot>(`/options/chain/${symbol}/capture`, {
      method: "POST",
    }),
  getChainBatch: (symbols: string[]) =>
    request<{
      results: Record<string, OptionChainSnapshot>;
      errors: Record<string, string>;
    }>("/options/chain/batch", {
      method: "POST",
      body: JSON.stringify({ symbols }),
    }),
  getTermStructure: (
    symbol: string,
    snapshotId?: string,
    source?: MarketDataSource,
  ) =>
    request<VolTermStructureResponse>(
      `/options/term-structure/${symbol}${buildOptionSnapshotQuery({
        snapshotId,
        source,
      })}`,
    ),
  getSurface: (
    symbol: string,
    snapshotId?: string,
    source?: MarketDataSource,
  ) =>
    request<VolSurfaceResponse>(
      `/options/surface/${symbol}${buildOptionSnapshotQuery({
        snapshotId,
        source,
      })}`,
    ),
  getNews: (symbol: string) => request<NewsItem[]>(`/options/news/${symbol}`),
  getActivity: (symbol: string, snapshotId?: string) =>
    request<ActivitySignalRecord[]>(
      `/options/activity/${symbol}${
        snapshotId ? `?snapshot_id=${snapshotId}` : ""
      }`,
    ),

  // ── Archive ──
  getArchiveCoverage: (symbol: string) =>
    request<ArchiveCoverageRecord>(`/archive/coverage/${symbol}`),
  createArchiveImportJob: (body: {
    symbols: string[];
    history_period?: string;
    interval?: string;
    refresh_snapshots?: boolean;
  }) =>
    request<ArchiveImportJobRecord>("/archive/import-jobs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listArchiveImportJobs: () =>
    request<ArchiveImportJobRecord[]>("/archive/import-jobs"),
  getArchiveImportJob: (jobId: string) =>
    request<ArchiveImportJobRecord>(`/archive/import-jobs/${jobId}`),

  // ── Strategy Evaluation ──
  evaluateStrategy: (body: StrategyEvaluationRequest) =>
    request<StrategyEvaluation>("/strategies/evaluate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ── Paper Trades ──
  createPaperTrade: (body: PaperTradeCreateRequest) =>
    request<PaperTradeRecord>("/paper-trades", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listPaperTrades: () => request<PaperTradeRecord[]>("/paper-trades"),

  // ── Portfolio ──
  getPortfolioAccount: () =>
    request<PortfolioAccountRecord>("/portfolio/account"),
  getPortfolioPositions: () =>
    request<PortfolioPositionRecord[]>("/portfolio/positions"),
  getPortfolioExposure: () =>
    request<PortfolioExposureRecord>("/portfolio/exposure"),
  listPortfolioActivityImports: () =>
    request<PortfolioActivityImportHistoryItemRecord[]>(
      "/portfolio/activity-imports",
    ),
  getPortfolioActivityImportRows: (
    fingerprint: string,
    rowNumbers: number[] = [],
  ) => {
    const query = rowNumbers.length
      ? `?${rowNumbers
          .map(
            (rowNumber) =>
              `row_numbers=${encodeURIComponent(String(rowNumber))}`,
          )
          .join("&")}`
      : "";
    return request<PortfolioActivityImportLineageRecord>(
      `/portfolio/activity-imports/${fingerprint}/rows${query}`,
    );
  },
  rollbackPortfolioActivityImport: (fingerprint: string) =>
    request<PortfolioActivityImportRollbackResultRecord>(
      `/portfolio/activity-imports/${fingerprint}`,
      { method: "DELETE" },
    ),
  previewPortfolioActivityImport: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<PortfolioActivityImportPreviewRecord>(
      "/portfolio/activity-imports/preview",
      { method: "POST", body: formData },
    );
  },
  importPortfolioActivity: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<PortfolioActivityImportResultRecord>(
      "/portfolio/activity-imports",
      { method: "POST", body: formData },
    );
  },
  createPositionFromPaperTrade: (paperTradeId: string) =>
    request<PortfolioPositionRecord>(
      `/portfolio/positions/from-paper-trade/${paperTradeId}`,
      { method: "POST" },
    ),
  closePortfolioPosition: (positionId: string) =>
    request<PortfolioPositionRecord>(
      `/portfolio/positions/${positionId}/close`,
      { method: "POST" },
    ),
  getExpirationCalendar: () =>
    request<ExpirationCalendarItemRecord[]>("/portfolio/expiration-calendar"),

  // ── Portfolio Risk Analytics ──
  getRegimeDecomposition: () =>
    request<RegimeDecomposition>("/portfolio/risk/regime-decomposition"),
  getEventDecomposition: () =>
    request<EventDecomposition>("/portfolio/risk/event-decomposition"),
  getStrategyConcentration: () =>
    request<StrategyConcentration>(
      "/portfolio/risk/strategy-concentration",
    ),
  calculateWhatIfScenario: (
    underlyingMovePct: number,
    ivShiftPct: number,
  ) =>
    request<WhatIfOverlayResult>(
      `/portfolio/risk/what-if?underlying_move_pct=${encodeURIComponent(
        String(underlyingMovePct),
      )}&iv_shift_pct=${encodeURIComponent(String(ivShiftPct))}`,
      { method: "POST" },
    ),
  getCorrelationMatrix: (lookbackDays?: number) => {
    const query = lookbackDays ? `?lookback_days=${lookbackDays}` : "";
    return request<CorrelationMatrixData>(
      `/portfolio/risk/correlation-matrix${query}`,
    );
  },

  // ── Watchlists ──
  getWatchlists: () => request<WatchlistRecord[]>("/watchlists"),
  createWatchlist: (body: { name: string }) =>
    request<WatchlistRecord>("/watchlists", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  renameWatchlist: (watchlistId: string, body: { name: string }) =>
    request<WatchlistRecord>(`/watchlists/${watchlistId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteWatchlist: (watchlistId: string) =>
    request<void>(`/watchlists/${watchlistId}`, { method: "DELETE" }),
  createStrategyWatchlist: (body: {
    strategy_name: StrategyName;
    name?: string | null;
    limit?: number;
  }) =>
    request<WatchlistRecord>("/watchlists/strategy", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  refreshStrategyWatchlist: (watchlistId: string) =>
    request<WatchlistRecord>(`/watchlists/${watchlistId}/refresh`, {
      method: "POST",
    }),
  exportWatchlist: (watchlistId: string) =>
    request<WatchlistExportRecord>(`/watchlists/${watchlistId}/export`),
  importWatchlist: (body: {
    name?: string | null;
    strategy_name?: StrategyName | null;
    strategy_limit?: number | null;
    generated_at?: string | null;
    last_refreshed_at?: string | null;
    items: Array<{
      symbol: string;
      notes?: string | null;
      signal_payload?: WatchlistSignalPayloadRecord | null;
      source_snapshot_id?: string | null;
      source_as_of_utc?: string | null;
      last_refreshed_at?: string | null;
    }>;
  }) =>
    request<WatchlistRecord>("/watchlists/import", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  addWatchlistItem: (
    watchlistId: string,
    body: { symbol: string; notes?: string | null },
  ) =>
    request<WatchlistRecord>(`/watchlists/${watchlistId}/items`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  removeWatchlistItem: (watchlistId: string, symbol: string) =>
    request<WatchlistRecord>(
      `/watchlists/${watchlistId}/items/${symbol}`,
      { method: "DELETE" },
    ),

  // ── Scanners ──
  getScannerScreens: () =>
    request<StrategyScreenRecord[]>("/scanners/screens"),
  createScannerScreen: (body: {
    strategy_name: StrategyName;
    name?: string | null;
    mode?: ScannerMode | null;
    strategy_limit?: number;
    symbols?: string[];
    source_watchlist_id?: string | null;
  }) =>
    request<StrategyScreenRecord>("/scanners/screens", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getScannerScreen: (screenId: string) =>
    request<StrategyScreenRecord>(`/scanners/screens/${screenId}`),
  runScannerScreen: (screenId: string) =>
    request<StrategyScreenRunRecord>(
      `/scanners/screens/${screenId}/runs`,
      { method: "POST" },
    ),
  getScannerRun: (runId: string) =>
    request<StrategyScreenRunRecord>(`/scanners/runs/${runId}`),

  // ── Factors & Regimes ──
  getFactorSnapshot: (
    symbol: string,
    snapshotId?: string,
    forceRefresh = false,
  ) =>
    request<FactorSnapshotRecord>(
      `/factors/${symbol}?force_refresh=${forceRefresh}${
        snapshotId ? `&snapshot_id=${snapshotId}` : ""
      }`,
    ),
  getFactorSnapshotById: (factorSnapshotId: string) =>
    request<FactorSnapshotRecord>(
      `/factors/snapshots/${factorSnapshotId}`,
    ),
  getFactorHistory: (symbol: string, limit = 20) =>
    request<FactorSnapshotRecord[]>(
      `/factors/${symbol}/history?limit=${limit}`,
    ),
  getRegimeSnapshot: (
    symbol: string,
    snapshotId?: string,
    forceRefresh = false,
  ) =>
    request<RegimeSnapshotRecord>(
      `/regimes/${symbol}?force_refresh=${forceRefresh}${
        snapshotId ? `&snapshot_id=${snapshotId}` : ""
      }`,
    ),
  getRegimeSnapshotById: (regimeSnapshotId: string) =>
    request<RegimeSnapshotRecord>(
      `/regimes/snapshots/${regimeSnapshotId}`,
    ),

  // ── Events ──
  getEventCalendar: (params?: {
    symbol?: string | null;
    event_type?: string | null;
    start?: string | null;
    end?: string | null;
    status?: EventStatus | null;
  }) => {
    const query = new URLSearchParams();
    if (params?.symbol) query.set("symbol", params.symbol);
    if (params?.event_type) query.set("event_type", params.event_type);
    if (params?.start) query.set("start", params.start);
    if (params?.end) query.set("end", params.end);
    if (params?.status) query.set("status", params.status);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<EventCalendarItemRecord[]>(`/events/calendar${suffix}`);
  },
  getEventCalendarItem: (itemId: string) =>
    request<EventCalendarItemRecord>(`/events/calendar/${itemId}`),
  getEventBriefVersions: (itemId: string) =>
    request<EventBriefSummaryRecord[]>(
      `/events/calendar/${itemId}/briefs`,
    ),
  refreshEventBrief: (itemId: string) =>
    request<EventBriefRecord>(
      `/events/calendar/${itemId}/briefs/refresh`,
      { method: "POST" },
    ),
  getEventBrief: (briefId: string) =>
    request<EventBriefRecord>(`/events/briefs/${briefId}`),

  // ── Research ──
  createResearchNotebook: (body: {
    symbol: string;
    strategy_name?: StrategyName | null;
    event_calendar_item_id?: string | null;
  }) =>
    request<ResearchNotebookRecord>("/research/notebooks", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getResearchNotebooks: () =>
    request<ResearchNotebookRecord[]>("/research/notebooks"),
  getResearchNotebook: (notebookId: string) =>
    request<ResearchNotebookDetailRecord>(
      `/research/notebooks/${notebookId}`,
    ),
  getResearchBriefVersions: (notebookId: string) =>
    request<ResearchBriefSummaryRecord[]>(
      `/research/notebooks/${notebookId}/briefs`,
    ),
  getResearchBrief: (briefId: string) =>
    request<ResearchBriefRecord>(`/research/briefs/${briefId}`),
  createResearchTask: (body: {
    task_type: ResearchTaskType;
    target_type: ResearchTaskTargetType;
    target_id: string;
  }) =>
    request<ResearchTaskRecord>("/research/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getResearchTasks: (params?: {
    notebook_id?: string | null;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.notebook_id) query.set("notebook_id", params.notebook_id);
    if (params?.limit) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<ResearchTaskRecord[]>(`/research/tasks${suffix}`);
  },
  getResearchTask: (taskId: string) =>
    request<ResearchTaskRecord>(`/research/tasks/${taskId}`),
  getResearchTaskEvents: (taskId: string) =>
    request<ResearchTaskEventRecord[]>(
      `/research/tasks/${taskId}/events`,
    ),
  runResearchTaskNow: (taskId: string) =>
    request<ResearchTaskRecord>(`/research/tasks/${taskId}/run`, {
      method: "POST",
    }),
  uploadResearchSource: (notebookId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<ResearchSourceRecord>(
      `/research/notebooks/${notebookId}/sources/upload`,
      { method: "POST", body: formData },
    );
  },
  ingestWebSource: (notebookId: string, url: string) =>
    request<ResearchSourceRecord>(
      `/research/notebooks/${notebookId}/sources/web`,
      { method: "POST", body: JSON.stringify({ url }) },
    ),
  searchNotebook: (notebookId: string, query: string, topK = 5) =>
    request<ResearchChunkRecord[]>(
      `/research/notebooks/${notebookId}/search`,
      { method: "POST", body: JSON.stringify({ query, top_k: topK }) },
    ),

  // ── Forecasts ──
  createForecastSet: (body: {
    context_type?: ForecastContextType;
    context_id?: string | null;
    symbol: string;
    strategy_name?: StrategyName | null;
    event_brief_id?: string | null;
    strategy_evaluation?: StrategyEvaluation | null;
    inline_strategy?: StrategyEvaluationRequest | null;
    forecast_profile?: ForecastProfileRecord | null;
  }) =>
    request<ForecastSetRecord>("/forecasts/sets", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getForecastSet: (forecastSetId: string) =>
    request<ForecastSetRecord>(`/forecasts/sets/${forecastSetId}`),
  getForecastScorecard: (params?: {
    strategy_name?: string | null;
    event_type?: string | null;
    source_type?: ForecastSourceType | null;
  }) => {
    const query = new URLSearchParams();
    if (params?.strategy_name)
      query.set("strategy_name", params.strategy_name);
    if (params?.event_type) query.set("event_type", params.event_type);
    if (params?.source_type) query.set("source_type", params.source_type);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<CalibrationScorecardRecord>(
      `/forecasts/scorecard${suffix}`,
    );
  },

  // ── Reviews ──
  getTradeReviews: () => request<TradeReviewRecord[]>("/reviews"),
  getTradeReview: (paperTradeId: string) =>
    request<TradeReviewRecord>(
      `/reviews/paper-trades/${paperTradeId}`,
    ),

  // ── Alerts ──
  getAlertRules: () => request<AlertRuleRecord[]>("/alerts/rules"),
  createAlertRule: (body: {
    watchlist_id?: string | null;
    symbol?: string | null;
    name: string;
    rule_type: AlertRuleType;
    condition: AlertCondition;
    cooldown_seconds?: number;
  }) =>
    request<AlertRuleRecord>("/alerts/rules", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateAlertRule: (ruleId: string, body: Partial<AlertRuleRecord>) =>
    request<AlertRuleRecord>(`/alerts/rules/${ruleId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  muteAlertRule: (ruleId: string) =>
    request<AlertRuleRecord>(`/alerts/rules/${ruleId}/mute`, {
      method: "POST",
    }),
  getAlertEvents: () => request<AlertEventRecord[]>("/alerts/events"),
  acknowledgeAlertEvent: (eventId: string) =>
    request<AlertEventRecord>(`/alerts/events/${eventId}/ack`, {
      method: "POST",
    }),

  // ── Backtests ──
  listBacktestRuns: () => request<BacktestRunRecord[]>("/backtests/runs"),
  createBacktestRun: (body: BacktestConfig) =>
    request<BacktestRunRecord>("/backtests/runs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getBacktestRun: (runId: string) =>
    request<BacktestRunRecord>(`/backtests/runs/${runId}`),
  getBacktestResults: (runId: string) =>
    request<BacktestRunResultsRecord>(
      `/backtests/runs/${runId}/results`,
    ),
  cancelBacktestRun: (runId: string) =>
    request<BacktestRunRecord>(`/backtests/runs/${runId}/cancel`, {
      method: "POST",
    }),

  // ── RL Research ──
  createRLDataset: (body: { name: string; symbol_universe: string[] }) =>
    request<RLDatasetRecord>("/research/rl/datasets", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listRLDatasets: () => request<RLDatasetRecord[]>("/research/rl/datasets"),
  createRLTrainingRun: (body: {
    dataset_id: string;
    algorithm?: string;
  }) =>
    request<RLTrainingRunRecord>("/research/rl/training-runs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listRLTrainingRuns: () =>
    request<RLTrainingRunRecord[]>("/research/rl/training-runs"),
  getRLTrainingRun: (runId: string) =>
    request<RLTrainingRunRecord>(
      `/research/rl/training-runs/${runId}`,
    ),
  listRLModels: () =>
    request<RLModelArtifactRecord[]>("/research/rl/models"),
  approveRLModel: (modelId: string) =>
    request<RLModelArtifactRecord>(
      `/research/rl/models/${modelId}/approve`,
      { method: "POST" },
    ),
  archiveRLModel: (modelId: string) =>
    request<RLModelArtifactRecord>(
      `/research/rl/models/${modelId}/archive`,
      { method: "POST" },
    ),
  getRLSignals: (symbol: string) =>
    request<RLSignalRecord[]>(`/research/rl/signals/${symbol}`),

  // ── Settings ──
  getRiskProfile: () => request<RiskProfile>("/settings/risk-profile"),
  saveRiskProfile: (body: RiskProfile) =>
    request<RiskProfile>("/settings/risk-profile", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getLLMPolicy: () => request<LLMPolicy>("/settings/llm-policy"),
  saveLLMPolicy: (body: LLMPolicy) =>
    request<LLMPolicy>("/settings/llm-policy", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getLLMCosts: (days = 7) =>
    request<LLMCostReport>(`/settings/llm-costs?days=${days}`),

  // ── Analysis ──
  createAnalysisRun: (body: {
    symbol: string;
    thesis?: string;
    as_of_snapshot_id?: string;
    expiry_preference?: string;
    strategy_preference?: StrategyName;
    screen_context_id?: string;
    event_brief_id?: string;
    notebook_id?: string;
    forecast_mode?: ForecastMode;
    comparison_mode?: "off" | "side_by_side";
    comparison_provider_ids?: string[];
  }) =>
    request<AnalysisRunResponse>("/analysis/runs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getAnalysisRun: (runId: string) =>
    request<AnalysisRunDetail>(`/analysis/runs/${runId}`),
};

// ── SSE subscription ──

const ANALYSIS_EVENTS = [
  "analysis.started",
  "analysis.stage",
  "analysis.warning",
  "analysis.citation",
  "analysis.completed",
  "analysis.failed",
] as const;

const ANALYSIS_TERMINAL_EVENTS = new Set<string>([
  "analysis.completed",
  "analysis.failed",
]);

export function subscribeAnalysisEvents(
  runId: string,
  onEvent: (eventType: string, payload: unknown) => void,
  onError?: (error: Event) => void,
) {
  const source = new EventSource(`${API_BASE}/analysis/runs/${runId}/events`);
  let closed = false;
  ANALYSIS_EVENTS.forEach((eventType) => {
    source.addEventListener(eventType, (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      onEvent(eventType, data);
      if (ANALYSIS_TERMINAL_EVENTS.has(eventType)) {
        closed = true;
        source.close();
      }
    });
  });
  source.onerror = (event) => {
    if (closed) {
      return;
    }
    onError?.(event);
  };
  return () => {
    closed = true;
    source.close();
  };
}

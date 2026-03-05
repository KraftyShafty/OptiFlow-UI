// Analysis run, LLM usage, and paper trade types.

import type {
  Citation,
  QualityFlag,
  RouteTargetsRecord,
  StrategyName,
} from "./common";
import type {
  ProbabilitySummaryRecord,
  StrategyEvaluation,
  StrategyEvaluationRequest,
} from "./strategy";
import type { EventBriefSummaryRecord, EventBriefRecord } from "./events";
import type {
  ResearchNotebookRecord,
  ResearchBriefRecord,
} from "./research";
import type { ForecastSetRecord } from "./forecast";
import type { FactorSnapshotRecord, RegimeSnapshotRecord } from "./watchlist";

export interface ResearchSignalSummary {
  symbol: string;
  action_label: string;
  confidence: number;
  detail: string;
  model_artifact_id: string;
  model_name?: string | null;
  created_at: string;
}

export interface AnalysisOutput {
  recommendation_status: "no_trade" | "watch" | "consider";
  bull_case: string;
  bear_case: string;
  candidate_strategies: StrategyName[];
  preferred_strategy?: StrategyName | null;
  risk_warnings: string[];
  quality_flags: QualityFlag[];
  citations: Citation[];
  data_timestamps: Record<string, string>;
  confidence_band: string;
  position_sizing_hint?: string | null;
  why_not_trade_now?: string | null;
  research_signal_summary?: ResearchSignalSummary | null;
  event_brief_summary?: EventBriefSummaryRecord | null;
  research_notebook_summary?: ResearchNotebookRecord | null;
  probability_summary?: ProbabilitySummaryRecord | null;
  forecast_set_id?: string | null;
  model_attribution?: Record<string, unknown>;
  comparison_summary?: string | null;
}

export interface AnalysisRunResponse {
  run_id: string;
  status: string;
  events_url: string;
}

export interface LLMAttemptRecord {
  stage: string;
  provider: string;
  model?: string | null;
  status:
    | "succeeded"
    | "failed"
    | "validation_failed"
    | "budget_skipped"
    | "not_configured"
    | "deterministic_fallback";
  started_at_utc: string;
  finished_at_utc: string;
  latency_ms: number;
  prompt_version?: string | null;
  prompt_hash?: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_usd: number;
  failure_detail?: string | null;
}

export interface LLMComparisonOutput {
  provider: string;
  model?: string | null;
  status: string;
  bull_case?: string | null;
  bear_case?: string | null;
  confidence_band?: string | null;
  why_not_trade_now?: string | null;
  prompt_version?: string | null;
  prompt_hash?: string | null;
  latency_ms: number;
  estimated_cost_usd: number;
  failure_detail?: string | null;
}

export interface LLMUsageSummary {
  calls: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  estimated_cost_usd: number;
  providers_used: Array<Record<string, unknown>>;
  provider_failures: Array<Record<string, unknown>>;
  attempts: LLMAttemptRecord[];
  prompt_versions: string[];
  comparison_outputs: LLMComparisonOutput[];
  fallback_reason?: string | null;
}

export interface AnalysisRunDetail {
  run_id: string;
  symbol: string;
  status: string;
  request_payload: Record<string, unknown>;
  result_payload?: Record<string, unknown> | null;
  llm_usage: LLMUsageSummary;
  quality_flags: QualityFlag[];
  created_at: string;
  updated_at: string;
}

// Paper Trade types

export interface PaperTradeCreateRequest {
  symbol: string;
  strategy_name?: StrategyName | null;
  entry_snapshot_id?: string | null;
  entry_regime_snapshot_id?: string | null;
  entry_event_brief_id?: string | null;
  entry_research_brief_id?: string | null;
  entry_forecast_set_id?: string | null;
  entry_analysis_run_id?: string | null;
  entry_scanner_candidate_id?: string | null;
  thesis: string;
  planned_exit?: string | null;
  tags?: string[];
  strategy_evaluation?: StrategyEvaluation | null;
  inline_strategy?: StrategyEvaluationRequest | null;
}

export interface PaperTradeEntryContextRecord {
  event_brief?: EventBriefRecord | null;
  research_brief?: ResearchBriefRecord | null;
  forecast_set?: ForecastSetRecord | null;
  factor_snapshot?: FactorSnapshotRecord | null;
  regime_snapshot?: RegimeSnapshotRecord | null;
}

export interface PaperTradeRecord {
  id: string;
  symbol: string;
  strategy_name?: StrategyName | null;
  entry_snapshot_id?: string | null;
  entry_regime_snapshot_id?: string | null;
  entry_event_brief_id?: string | null;
  entry_research_brief_id?: string | null;
  entry_forecast_set_id?: string | null;
  entry_analysis_run_id?: string | null;
  entry_scanner_candidate_id?: string | null;
  thesis: string;
  tags: string[];
  state: string;
  created_at: string;
  closed_at?: string | null;
  current_mark?: number | null;
  net_result?: number | null;
  linked_portfolio_position_id?: string | null;
  entry_context?: PaperTradeEntryContextRecord | null;
  route_targets: RouteTargetsRecord;
  leg_resolutions: Array<{
    label: string;
    outcome: string;
    pnl: number;
    intrinsic_value: number;
    quantity: number;
    quality_flags: QualityFlag[];
  }>;
}

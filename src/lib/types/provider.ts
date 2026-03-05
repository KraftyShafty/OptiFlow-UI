// Provider types: health, capabilities, drift, LLM telemetry, costs,
// fundamentals, sentiment, activity contracts, settings.

import type {
  ActivitySignalRecord,
  NewsItem,
  QualityFlag,
  StrategyName,
} from "./common";

export type ProviderCapability =
  | "options_chain"
  | "underlying_history"
  | "news"
  | "fundamentals"
  | "sentiment"
  | "historical_options"
  | "streaming"
  | "options_activity"
  | "provider_greeks";

export interface ProviderCapabilityRecord {
  capability: ProviderCapability;
  supported: boolean;
  detail: string;
}

export interface ProviderHealthRecord {
  provider: string;
  healthy: boolean;
  enabled: boolean;
  configured: boolean;
  detail: string;
  capabilities: string[];
  capability_records?: ProviderCapabilityRecord[];
  endpoint?: string | null;
  checked_at_utc: string;
}

export interface OptionsActivityProviderContractRecord {
  symbol: string;
  provider: string;
  provider_supported: boolean;
  mode: "provider" | "heuristic_fallback" | "hybrid" | "unavailable";
  provider_detail: string;
  fallback_detail?: string | null;
  snapshot_id?: string | null;
  as_of_utc: string;
  provider_signals: ActivitySignalRecord[];
  heuristic_signals: ActivitySignalRecord[];
  effective_signals: ActivitySignalRecord[];
  quality_flags: QualityFlag[];
}

export interface FundamentalFieldRecord {
  key: string;
  label: string;
  value: string | number | boolean | null;
  formatted_value?: string | null;
  available: boolean;
}

export interface FundamentalsProviderContractRecord {
  symbol: string;
  provider: string;
  provider_supported: boolean;
  mode: "provider" | "unavailable";
  provider_detail: string;
  fallback_detail?: string | null;
  as_of_utc: string;
  fields: FundamentalFieldRecord[];
  available_field_count: number;
  total_field_count: number;
  field_coverage_rate: number;
  quality_flags: QualityFlag[];
}

export interface SentimentSignalRecord {
  label: "positive" | "neutral" | "negative";
  score: number;
  confidence: number;
  summary: string;
  headline_count: number;
  matched_headline_count: number;
}

export interface SentimentProviderContractRecord {
  symbol: string;
  provider: string;
  provider_supported: boolean;
  mode: "provider" | "heuristic_fallback" | "hybrid" | "unavailable";
  provider_detail: string;
  fallback_detail?: string | null;
  as_of_utc: string;
  provider_signal?: SentimentSignalRecord | null;
  heuristic_signal?: SentimentSignalRecord | null;
  effective_signal?: SentimentSignalRecord | null;
  news_items: NewsItem[];
  quality_flags: QualityFlag[];
}

export interface ProviderDriftMetricRecord {
  metric: string;
  yahoo_value: number | string | null;
  openbb_value: number | string | null;
  delta: number | null;
  threshold: number | null;
  breached: boolean;
  detail: string;
}

export interface ProviderDriftReportRecord {
  symbol: string;
  yahoo_snapshot_id: string | null;
  openbb_snapshot_id: string | null;
  as_of_utc: string;
  metrics: ProviderDriftMetricRecord[];
  breached_count: number;
  total_count: number;
  quality_flags: QualityFlag[];
}

export interface LLMProviderTelemetryRecord {
  provider: string;
  configured: boolean;
  healthy: boolean;
  detail: string;
  last_checked_at_utc: string;
  total_attempts: number;
  success_rate: number;
  validation_failure_rate: number;
  fallback_rate: number;
  average_latency_ms?: number | null;
  estimated_cost_usd: number;
  last_failure_detail?: string | null;
}

export interface LLMTelemetryReport {
  window_hours: number;
  generated_at_utc: string;
  providers: LLMProviderTelemetryRecord[];
}

export interface LLMCostDayRecord {
  date: string;
  estimated_cost_usd: number;
  run_count: number;
}

export interface LLMCostProviderTotalRecord {
  provider: string;
  estimated_cost_usd: number;
  run_count: number;
}

export interface LLMCostReport {
  window_days: number;
  generated_at_utc: string;
  total_estimated_cost_usd: number;
  total_runs: number;
  fallback_run_count: number;
  fallback_rate: number;
  daily: LLMCostDayRecord[];
  providers: LLMCostProviderTotalRecord[];
}

export interface BackgroundJobStatusRecord {
  job_name: string;
  status: string;
  detail: string;
  heartbeat_at: string;
  last_started_at?: string | null;
  last_finished_at?: string | null;
  last_success_at?: string | null;
  last_error_at?: string | null;
  next_expected_at?: string | null;
  last_duration_ms?: number | null;
  run_count: number;
  success_count: number;
  failure_count: number;
  context: Record<string, unknown>;
}

export interface BackgroundJobEventRecord {
  id?: number | null;
  job_name: string;
  status: string;
  detail: string;
  started_at?: string | null;
  finished_at?: string | null;
  duration_ms?: number | null;
  context: Record<string, unknown>;
  created_at: string;
}

export interface BackgroundJobTriggerResponse {
  job_name: string;
  accepted: boolean;
  detail: string;
  triggered_at: string;
}

export interface RiskProfile {
  account_size: number;
  max_risk_per_trade_pct: number;
  max_total_short_premium_pct: number;
  max_open_positions: number;
  min_open_interest: number;
  min_volume: number;
  max_bid_ask_spread_pct: number;
  allowed_strategies: StrategyName[];
  max_dte: number;
  min_dte: number;
  allow_american_option_approximations: boolean;
}

export interface LLMPolicy {
  llm_provider_priority: string[];
  max_cost_usd_per_run: number;
  max_llm_calls_per_run: number;
  max_prompt_tokens_per_run: number;
  max_completion_tokens_per_run: number;
  analyst_max_output_tokens: number;
  synthesizer_max_output_tokens: number;
  node_timeout_seconds: number;
  allow_approved_rl_signals_in_analysis: boolean;
}

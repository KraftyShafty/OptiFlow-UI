export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

export type QualityFlag =
  | "stale_data"
  | "missing_greeks"
  | "derived_greeks"
  | "derived_iv"
  | "wide_spread"
  | "low_volume"
  | "low_open_interest"
  | "delayed_source"
  | "stale_reference_rate"
  | "missing_dividend_yield_assumed_zero"
  | "american_option_bs_approximation"
  | "insufficient_surface_points"
  | "pin_risk"
  | "blocked_by_risk_profile"
  | "single_side_atm_iv"
  | "capability_unavailable"
  | "sparse_archive"
  | "heuristic_activity_signal"
  | "heuristic_sentiment"
  | "provider_drift";

export type StrategyName =
  | "long_call"
  | "long_put"
  | "covered_call"
  | "cash_secured_put"
  | "bull_call_debit_spread"
  | "bear_put_debit_spread"
  | "put_credit_spread"
  | "call_credit_spread"
  | "iron_condor"
  | "long_straddle";

export type ScannerMode =
  | "market_universe"
  | "portfolio_holdings"
  | "current_watchlist"
  | "custom_symbols";
export type TrendRegime = "bullish" | "bearish" | "rangebound" | "unstable";
export type VolatilityRegime =
  | "cheap_vol"
  | "fair_vol"
  | "rich_vol"
  | "event_distorted";
export type LiquidityRegime = "healthy" | "tradable_with_caution" | "poor";
export type EventRegime =
  | "clean"
  | "approaching_event"
  | "active_event_window"
  | "post_event_vol_crush";

export type EventScopeType = "symbol" | "macro" | "news_window";
export type EventStatus = "scheduled" | "active" | "completed" | "cancelled";
export type EventBriefBuildStatus = "completed" | "failed";
export type ForecastMode = "none" | "persist";
export type ForecastContextType =
  | "strategy_evaluation"
  | "lab_evaluation"
  | "analysis_run"
  | "event_brief"
  | "paper_trade_entry";
export type ForecastResolutionBasis =
  | "expiry"
  | "event_close"
  | "exit_date"
  | "threshold_window";
export type ForecastSourceType = "heuristic" | "ai" | "user";
export type ResearchTaskStatus = "queued" | "running" | "completed" | "failed";
export type ResearchTaskType =
  | "refresh_notebook_sources"
  | "generate_thesis_brief"
  | "compare_latest_brief_to_prior_brief"
  | "extract_contradictions_and_open_questions"
  | "build_event_prep_packet"
  | "refresh_event_brief";
export type ResearchTaskTargetType = "research_notebook" | "event_calendar_item";

export type PositionSide = "long" | "short";
export type OptionRight = "call" | "put";
export type MarketDataSource = "yahoo" | "openbb_bridge";

export interface Greeks {
  delta?: number | null;
  gamma?: number | null;
  theta?: number | null;
  vega?: number | null;
  rho?: number | null;
}

export interface UnderlyingQuote {
  symbol: string;
  name?: string | null;
  last_price: number;
  previous_close?: number | null;
  dividend_yield?: number | null;
  as_of_utc: string;
  source: string;
  quality_flags: QualityFlag[];
}

export interface OptionContractQuote {
  contract_symbol: string;
  option_type: OptionRight;
  expiration: string;
  dte: number;
  strike: number;
  bid?: number | null;
  ask?: number | null;
  last_price?: number | null;
  mark?: number | null;
  volume?: number | null;
  open_interest?: number | null;
  implied_volatility?: number | null;
  greeks_source: string;
  greeks: Greeks;
  quality_flags: QualityFlag[];
}

export interface OptionChainSnapshot {
  snapshot_id: string;
  symbol: string;
  as_of_utc: string;
  market_time_zone: string;
  source: string;
  underlying: UnderlyingQuote;
  expirations: string[];
  contracts: OptionContractQuote[];
  quality_flags: QualityFlag[];
}

export interface VolTermPoint {
  expiration: string;
  dte: number;
  atm_iv: number;
  call_iv?: number | null;
  put_iv?: number | null;
  underlying_price: number;
  quality_flags: QualityFlag[];
}

export interface VolTermStructureResponse {
  snapshot_id: string;
  as_of_utc: string;
  source: string;
  points: VolTermPoint[];
  quality_flags: QualityFlag[];
}

export interface VolSurfacePoint {
  contract_symbol: string;
  expiration: string;
  dte: number;
  strike: number;
  moneyness_pct: number;
  implied_volatility: number;
  option_type: OptionRight;
}

export interface VolSurfaceGrid {
  moneyness_buckets: number[];
  dte_buckets: number[];
  z_values: Array<Array<number | null>>;
}

export interface VolSurfaceResponse {
  snapshot_id: string;
  as_of_utc: string;
  source: string;
  raw_points: VolSurfacePoint[];
  grid?: VolSurfaceGrid | null;
  interpolation_method?: string | null;
  quality_flags: QualityFlag[];
}

export interface StrategyLegRequest {
  instrument_type: "option" | "underlying";
  side: PositionSide;
  quantity: number;
  contract_symbol?: string;
  option_type?: OptionRight | null;
  expiration?: string | null;
  strike?: number | null;
  entry_price?: number;
  multiplier?: number;
}

export interface ScenarioProbabilityInputRecord {
  scenario: string;
  probability: number;
}

export interface ForecastProfileRecord {
  iv_contraction_threshold?: number;
  scenario_probabilities?: ScenarioProbabilityInputRecord[];
}

export interface ProbabilitySummaryRecord {
  probability_of_profit?: number | null;
  expected_value?: number | null;
  expected_downside?: number | null;
  probability_of_max_loss_zone?: number | null;
  probability_of_assignment?: number | null;
  probability_within_expected_move?: number | null;
  probability_of_iv_contraction?: number | null;
  confidence_band: string;
  heuristic_inputs: Record<string, unknown>;
}

export interface WeightedOutcomeRecord {
  scenario: string;
  probability: number;
  underlying_price: number;
  payoff_at_expiry: number;
  payoff_at_target_date: number;
  weighted_payoff_at_expiry: number;
  weighted_payoff_at_target_date: number;
}

export interface EventContextSummaryRecord {
  event_brief_id: string;
  event_calendar_item_id: string;
  event_type: string;
  scheduled_at_utc?: string | null;
  expected_move_pct?: number | null;
  expected_move_abs?: number | null;
  risk_flags: string[];
  strategy_biases: string[];
  confidence?: number | null;
}

export interface StrategyEvaluationRequest {
  symbol: string;
  as_of_snapshot_id?: string | null;
  strategy_name?: StrategyName | null;
  legs: StrategyLegRequest[];
  pricing_mode: "mid" | "last" | "provider_mark" | "model_mark";
  event_brief_id?: string | null;
  forecast_set_id?: string | null;
  forecast_profile?: ForecastProfileRecord | null;
  use_probability_weighting?: boolean;
  underlying_price_override?: number | null;
  dividend_yield_override?: number | null;
  risk_free_rate_override?: number | null;
  target_date?: string | null;
}

export interface PriceSeriesPoint {
  underlying_price: number;
  value: number;
}

export interface StrategyEvaluation {
  strategy_name?: StrategyName | null;
  valuation_inputs: {
    snapshot_id: string;
    pricing_mode: string;
    spot_price: number;
    target_date?: string | null;
    risk_free_rate: number;
    dividend_yield: number;
  };
  per_leg: Array<{
    leg: StrategyLegRequest;
    current_price?: number | null;
    effective_entry_price?: number | null;
    current_greeks: Greeks;
    greeks_source: string;
    quality_flags: QualityFlag[];
  }>;
  aggregate_greeks: Greeks;
  payoff_series: PriceSeriesPoint[];
  date_slice_series: PriceSeriesPoint[];
  max_profit: number;
  max_loss: number;
  breakevens: number[];
  capital_at_risk: number;
  blocked_reasons: string[];
  position_size_hint?: number | null;
  risk_warnings: string[];
  quality_flags: QualityFlag[];
  probability_summary?: ProbabilitySummaryRecord | null;
  weighted_outcomes: WeightedOutcomeRecord[];
  event_context_summary?: EventContextSummaryRecord | null;
  forecast_set_id?: string | null;
}

export interface Citation {
  title: string;
  url?: string | null;
  published_at_utc?: string | null;
}

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

export interface RouteTargetsRecord {
  review_href?: string | null;
  event_brief_href?: string | null;
  research_brief_href?: string | null;
  forecast_set_href?: string | null;
  factor_snapshot_href?: string | null;
  regime_snapshot_href?: string | null;
}

export interface PaperTradeEntryContextRecord {
  event_brief?: EventBriefRecord | null;
  research_brief?: ResearchBriefRecord | null;
  forecast_set?: ForecastSetRecord | null;
  factor_snapshot?: FactorSnapshotRecord | null;
  regime_snapshot?: RegimeSnapshotRecord | null;
}

export interface NewsItem {
  title: string;
  publisher?: string | null;
  url?: string | null;
  published_at_utc?: string | null;
  summary?: string | null;
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

export interface PortfolioAccountRecord {
  id: string;
  name: string;
  base_currency: string;
  starting_cash: number;
  cash_balance: number;
  created_at: string;
}

export interface PortfolioLotRecord {
  id: string;
  instrument_type: "option" | "underlying";
  side: PositionSide;
  quantity_open: number;
  quantity_closed: number;
  contract_symbol?: string | null;
  option_type?: OptionRight | null;
  expiration?: string | null;
  strike?: number | null;
  multiplier: number;
  entry_price: number;
}

export interface PortfolioFillRecord {
  id: string;
  lot_id?: string | null;
  side: PositionSide;
  quantity: number;
  price: number;
  occurred_at: string;
}

export interface PortfolioPositionRecord {
  id: string;
  account_id: string;
  symbol: string;
  strategy_name?: StrategyName | null;
  state: "open" | "closed" | "expired";
  entry_snapshot_id?: string | null;
  source_paper_trade_id?: string | null;
  source_paper_trade?: PaperTradeRecord | null;
  opened_at: string;
  closed_at?: string | null;
  lots: PortfolioLotRecord[];
  fills: PortfolioFillRecord[];
  current_mark?: number | null;
  unrealized_pnl?: number | null;
  realized_pnl?: number | null;
  aggregate_greeks: Greeks;
  capital_at_risk?: number | null;
  import_metadata?: {
    import_source: string;
    file_name?: string | null;
    fingerprint?: string | null;
    source_row_numbers: number[];
    description?: string | null;
  } | null;
}

export interface ExpirationCalendarItemRecord {
  position_id: string;
  symbol: string;
  expiration: string;
  dte: number;
  short_exposure: boolean;
}

export interface PortfolioExposureRecord {
  nav: number;
  cash_balance: number;
  unrealized_pnl: number;
  realized_pnl: number;
  aggregate_greeks: Greeks;
  concentration_by_symbol: Record<string, number>;
  short_premium_exposure: number;
  expiration_calendar: ExpirationCalendarItemRecord[];
}

export interface PortfolioActivityImportRowRecord {
  row_number: number;
  activity_date?: string | null;
  instrument?: string | null;
  description: string;
  trans_code: string;
  quantity?: number | null;
  price?: number | null;
  amount?: number | null;
  category: string;
  action?: string | null;
  importable: boolean;
  note?: string | null;
}

export interface PortfolioImportedPositionPreviewRecord {
  symbol: string;
  instrument_type: "option" | "underlying";
  side: PositionSide;
  quantity_open: number;
  option_type?: OptionRight | null;
  expiration?: string | null;
  strike?: number | null;
  average_entry_price?: number | null;
  opened_at?: string | null;
  description: string;
}

export interface PortfolioActivityImportPreviewRecord {
  file_name: string;
  fingerprint: string;
  already_imported: boolean;
  row_count: number;
  importable_row_count: number;
  skipped_row_count: number;
  date_start?: string | null;
  date_end?: string | null;
  trans_code_counts: Record<string, number>;
  unsupported_code_counts: Record<string, number>;
  projected_open_positions: PortfolioImportedPositionPreviewRecord[];
  sample_rows: PortfolioActivityImportRowRecord[];
  notes: string[];
}

export interface PortfolioActivityImportResultRecord {
  file_name: string;
  fingerprint: string;
  imported_positions_count: number;
  imported_lots_count: number;
  imported_fills_count: number;
  skipped_row_count: number;
  imported_position_ids: string[];
  notes: string[];
}

export interface PortfolioActivityImportHistoryItemRecord {
  fingerprint: string;
  file_name: string;
  imported_at?: string | null;
  row_count?: number | null;
  imported_positions_count?: number | null;
  imported_lots_count?: number | null;
  imported_fills_count?: number | null;
  skipped_row_count?: number | null;
  date_start?: string | null;
  date_end?: string | null;
  current_position_count: number;
  current_open_position_count: number;
  rollback_allowed: boolean;
  rollback_reason?: string | null;
}

export interface PortfolioActivityImportLineageRecord {
  fingerprint: string;
  file_name: string;
  requested_row_numbers: number[];
  rows: PortfolioActivityImportRowRecord[];
  stored_row_count: number;
  missing_row_numbers: number[];
  row_storage_available: boolean;
  detail?: string | null;
}

export interface PortfolioActivityImportRollbackResultRecord {
  fingerprint: string;
  file_name: string;
  deleted_positions_count: number;
  deleted_lots_count: number;
  deleted_fills_count: number;
  removed_registry_entry: boolean;
  detail: string;
}

// Phase C: Portfolio Risk Analytics

export interface RegimeDecompositionBucket {
  regime_label: string;
  value: number;
  pct_of_total: number;
  position_count: number;
  aggregate_greeks: Greeks;
}

export interface RegimeDecomposition {
  by_trend: RegimeDecompositionBucket[];
  by_volatility: RegimeDecompositionBucket[];
  as_of_utc: string;
}

export interface EventDecompositionBucket {
  event_context: string;
  value: number;
  pct_of_total: number;
  position_count: number;
  aggregate_greeks: Greeks;
}

export interface EventDecomposition {
  by_event_context: EventDecompositionBucket[];
  as_of_utc: string;
}

export interface StrategyConcentrationBucket {
  strategy_name: string;
  value: number;
  pct_of_total: number;
  position_count: number;
  aggregate_greeks: Greeks;
}

export interface StrategyConcentration {
  by_strategy: StrategyConcentrationBucket[];
  herfindahl_index?: number | null;
  as_of_utc: string;
}

export interface WhatIfOverlayResult {
  scenario_label: string;
  base_nav: number;
  scenario_nav: number;
  nav_change: number;
  nav_change_pct: number;
  Greeks_impact: Greeks;
  affected_positions: number;
}

export interface CorrelationMatrixData {
  symbols: string[];
  correlation_matrix: number[][];
  lookback_days: number;
  interval: string;
  as_of_utc: string;
}

export interface WatchlistItemRecord {
  id: string;
  watchlist_id: string;
  symbol: string;
  notes?: string | null;
  signal_payload?: WatchlistSignalPayloadRecord | null;
  source_snapshot_id?: string | null;
  source_as_of_utc?: string | null;
  last_refreshed_at?: string | null;
  chain_context?: WatchlistChainContextRecord | null;
  activity_signals?: ActivitySignalRecord[];
  factor_snapshot?: FactorSnapshotRecord | null;
  regime_snapshot?: RegimeSnapshotRecord | null;
  snapshot_age_seconds?: number | null;
  snapshot_is_stale?: boolean | null;
  current_rank?: number | null;
  previous_rank?: number | null;
  rank_delta?: number | null;
  created_at: string;
}

export interface WatchlistSignalPayloadRecord {
  rank_score?: number | null;
  spot_price?: number | null;
  atm_iv?: number | null;
  realized_vol?: number | null;
  iv_premium?: number | null;
  bullish_score?: number | null;
  bearish_score?: number | null;
  rangebound_score?: number | null;
  liquidity_score?: number | null;
  activity_score?: number | null;
  quiet_score?: number | null;
  iv_rich_score?: number | null;
  iv_cheap_score?: number | null;
  avg_spread?: number | null;
  avg_volume?: number | null;
  avg_open_interest?: number | null;
  cash_coverage?: number | null;
  cash_required?: number | null;
  ownership_shares?: number | null;
  signal_count?: number | null;
  primary_signal_keys?: string[];
  primary_signal_labels?: string[];
  primary_signal_metrics?: Array<{
    key: string;
    label: string;
    value?: number | null;
    formatted_value?: string | null;
    tone?: string;
  }>;
}

export interface WatchlistChainContextRecord {
  snapshot_id: string;
  as_of_utc: string;
  source: string;
  underlying_price?: number | null;
  expiration_count: number;
  avg_spread?: number | null;
  avg_volume?: number | null;
  avg_open_interest?: number | null;
  quality_flags: QualityFlag[];
}

export interface WatchlistRecord {
  id: string;
  name: string;
  is_default: boolean;
  strategy_name?: StrategyName | null;
  strategy_limit?: number | null;
  source_scanner_screen_id?: string | null;
  last_scanner_run_id?: string | null;
  items: WatchlistItemRecord[];
  generated_at?: string | null;
  last_refreshed_at?: string | null;
  created_at: string;
}

export interface ScannerCandidateRecord {
  id: string;
  run_id: string;
  symbol: string;
  rank: number;
  score: number;
  previous_rank?: number | null;
  rank_delta?: number | null;
  notes?: string | null;
  signal_payload: WatchlistSignalPayloadRecord;
  source_snapshot_id?: string | null;
  source_as_of_utc?: string | null;
  last_refreshed_at?: string | null;
  chain_context?: WatchlistChainContextRecord | null;
  activity_signals?: ActivitySignalRecord[];
  factor_snapshot?: FactorSnapshotRecord | null;
  regime_snapshot?: RegimeSnapshotRecord | null;
}

export interface StrategyScreenRecord {
  id: string;
  name: string;
  strategy_name: StrategyName;
  mode: ScannerMode;
  strategy_limit: number;
  symbols: string[];
  source_watchlist_id?: string | null;
  last_run_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StrategyScreenRunRecord {
  id: string;
  screen_id: string;
  strategy_name: StrategyName;
  status: "queued" | "running" | "completed" | "failed";
  funnel_counts: Record<string, number>;
  generated_at: string;
  candidates: ScannerCandidateRecord[];
}

export interface FactorValueRecord {
  key: string;
  family: string;
  label: string;
  value?: number | boolean | null;
  formatted_value?: string | null;
  tone: string;
}

export interface StrategyFitScoreRecord {
  strategy_name: StrategyName;
  total_score: number;
  factor_contributions: Record<string, number>;
  blocking_reasons: string[];
  strongest_positive_signals: string[];
  strongest_negative_signals: string[];
  notes?: string | null;
}

export interface FactorSnapshotRecord {
  id: string;
  symbol: string;
  source_snapshot_id: string;
  source_as_of_utc: string;
  factors: FactorValueRecord[];
  strategy_fit_scores: StrategyFitScoreRecord[];
  quality_flags: QualityFlag[];
  created_at: string;
}

export interface RegimeSnapshotRecord {
  id: string;
  symbol: string;
  factor_snapshot_id: string;
  source_snapshot_id: string;
  source_as_of_utc: string;
  trend_regime: TrendRegime;
  volatility_regime: VolatilityRegime;
  liquidity_regime: LiquidityRegime;
  event_regime: EventRegime;
  evidence: Record<string, unknown>;
  summary: string;
  created_at: string;
}

export interface ExpectedMoveProfileRecord {
  basis_symbol?: string | null;
  underlying_price?: number | null;
  implied_move_pct?: number | null;
  implied_move_abs?: number | null;
  front_expiration?: string | null;
  dte_to_expiration?: number | null;
  iv_basis?: number | null;
}

export interface HistoricalMoveSummaryRecord {
  sample_size: number;
  avg_abs_move_pct?: number | null;
  median_abs_move_pct?: number | null;
  max_abs_move_pct?: number | null;
}

export interface IVCrushProfileRecord {
  basis_symbol?: string | null;
  front_expiration?: string | null;
  next_expiration?: string | null;
  front_iv?: number | null;
  next_iv?: number | null;
  front_to_next_gap?: number | null;
  expected_gap_compression?: number | null;
}

export interface EventBriefSummaryRecord {
  id: string;
  event_calendar_item_id: string;
  version: number;
  supersedes_brief_id?: string | null;
  is_current: boolean;
  build_status: EventBriefBuildStatus;
  expected_move_profile: ExpectedMoveProfileRecord;
  risk_flags: string[];
  confidence?: number | null;
  freshness_at_utc?: string | null;
  created_at: string;
}

export interface EventBriefRecord {
  id: string;
  event_calendar_item_id: string;
  version: number;
  supersedes_brief_id?: string | null;
  is_current: boolean;
  build_status: EventBriefBuildStatus;
  expected_move_profile: ExpectedMoveProfileRecord;
  historical_analog_summary: HistoricalMoveSummaryRecord;
  iv_crush_profile: IVCrushProfileRecord;
  risk_flags: string[];
  strategy_biases: string[];
  citations: Citation[];
  confidence?: number | null;
  freshness_at_utc?: string | null;
  created_at: string;
}

export interface EventCalendarItemRecord {
  id: string;
  event_type: string;
  scope_type: EventScopeType;
  symbol?: string | null;
  related_symbols: string[];
  scheduled_at_utc?: string | null;
  window_start_utc?: string | null;
  window_end_utc?: string | null;
  provider_source: string;
  source_key: string;
  status: EventStatus;
  coverage_flags: string[];
  freshness_at_utc?: string | null;
  current_brief?: EventBriefSummaryRecord | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchSourceRecord {
  id: string;
  notebook_id: string;
  source_type: string;
  title: string;
  url?: string | null;
  published_at_utc?: string | null;
  source_hash: string;
  summary_excerpt?: string | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

export interface ResearchChunkRecord {
  chunk_id: string;
  source_id: string;
  source_title: string;
  chunk_index: number;
  text: string;
  score: number;
  token_count: number;
}

export interface ResearchBriefSummaryRecord {
  id: string;
  notebook_id: string;
  version: number;
  supersedes_brief_id?: string | null;
  thesis_summary: string;
  contradiction_summary?: string | null;
  unresolved_questions: string[];
  delta_summary?: string | null;
  source_ids: string[];
  citations: Citation[];
  model_provider: Record<string, unknown>;
  created_at: string;
}

export type ResearchBriefRecord = ResearchBriefSummaryRecord;

export interface ResearchNotebookRecord {
  id: string;
  symbol: string;
  strategy_name?: StrategyName | null;
  event_calendar_item_id?: string | null;
  current_brief_id?: string | null;
  unresolved_questions_summary?: string | null;
  contradiction_summary?: string | null;
  latest_source_bundle_hash?: string | null;
  source_count: number;
  current_brief?: ResearchBriefSummaryRecord | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchNotebookDetailRecord extends ResearchNotebookRecord {
  sources: ResearchSourceRecord[];
}

export interface ResearchTaskEventRecord {
  id?: number | null;
  task_id: string;
  stage: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface ResearchTaskRecord {
  id: string;
  task_type: ResearchTaskType;
  target_type: ResearchTaskTargetType;
  target_id: string;
  status: ResearchTaskStatus;
  requested_by: "local_user" | "system";
  model_provider: string;
  source_ids: string[];
  started_at?: string | null;
  finished_at?: string | null;
  duration_ms?: number | null;
  result_ref_type?: string | null;
  result_ref_id?: string | null;
  result_payload: Record<string, unknown>;
  created_at: string;
}

export interface ForecastPredictionRecord {
  id: string;
  forecast_question_id: string;
  source_type: ForecastSourceType;
  probability: number;
  rationale_summary: string;
  citations: Citation[];
  model_provider: Record<string, unknown>;
  created_at: string;
}

export interface ForecastOutcomeRecord {
  id: string;
  forecast_question_id: string;
  settled_value?: boolean | null;
  settled_at?: string | null;
  settlement_source?: string | null;
  settlement_payload: Record<string, unknown>;
  created_at: string;
}

export interface ForecastQuestionRecord {
  id: string;
  forecast_set_id: string;
  question_type: string;
  subject_type: string;
  subject_id?: string | null;
  resolution_basis: ForecastResolutionBasis;
  resolution_at_utc?: string | null;
  parameters: Record<string, unknown>;
  context_payload: Record<string, unknown>;
  prediction?: ForecastPredictionRecord | null;
  outcome?: ForecastOutcomeRecord | null;
  created_at: string;
}

export interface ForecastSetRecord {
  id: string;
  context_type: ForecastContextType;
  context_id?: string | null;
  symbol: string;
  strategy_name?: StrategyName | null;
  event_brief_id?: string | null;
  analysis_run_id?: string | null;
  probability_summary?: ProbabilitySummaryRecord | null;
  weighted_outcomes: WeightedOutcomeRecord[];
  event_context_summary?: EventContextSummaryRecord | null;
  questions: ForecastQuestionRecord[];
  created_at: string;
  updated_at: string;
}

export interface CalibrationScorecardRecord {
  filter_summary: Record<string, unknown>;
  settled_prediction_count: number;
  mean_brier_score?: number | null;
  hit_rate?: number | null;
  buckets: Array<{
    label: string;
    count: number;
    avg_predicted: number;
    avg_outcome: number;
  }>;
}

export interface TradeReviewRecord {
  id: string;
  paper_trade_id: string;
  paper_trade: PaperTradeRecord;
  event_brief?: EventBriefRecord | null;
  research_brief?: ResearchBriefRecord | null;
  factor_snapshot?: FactorSnapshotRecord | null;
  regime_snapshot?: RegimeSnapshotRecord | null;
  forecast_set?: ForecastSetRecord | null;
  supported_signals: string[];
  failed_signals: string[];
  thesis_alignment: string;
  confidence_assessment: string;
  historical_context?: string | null;
  follow_up_actions: string[];
  forecast_accuracy_notes: string[];
  settled_question_count: number;
  forecast_brier_score?: number | null;
  route_targets: RouteTargetsRecord;
  created_at: string;
}

export interface WatchlistExportRecord {
  name: string;
  strategy_name?: StrategyName | null;
  strategy_limit?: number | null;
  generated_at?: string | null;
  last_refreshed_at?: string | null;
  exported_at: string;
  items: Array<{
    symbol: string;
    notes?: string | null;
    signal_payload?: WatchlistSignalPayloadRecord | null;
    source_snapshot_id?: string | null;
    source_as_of_utc?: string | null;
    last_refreshed_at?: string | null;
    snapshot_age_seconds?: number | null;
    snapshot_is_stale?: boolean | null;
  }>;
}

export interface AlertCondition {
  threshold?: number | null;
  lookback?: number | null;
  symbol?: string | null;
  strategy_name?: StrategyName | null;
}

export type AlertRuleType =
  | "price_above"
  | "price_below"
  | "atm_iv_above"
  | "atm_iv_below"
  | "iv_rank_above"
  | "iv_rank_below"
  | "term_slope_change"
  | "skew_shift"
  | "spread_inside"
  | "volume_spike"
  | "open_interest_spike"
  | "activity_signal"
  | "expiry_warning"
  | "pin_risk"
  | "portfolio_risk"
  | "provider_drift";

export interface AlertRuleRecord {
  id: string;
  watchlist_id?: string | null;
  symbol?: string | null;
  name: string;
  rule_type: AlertRuleType;
  condition: AlertCondition;
  cooldown_seconds: number;
  enabled: boolean;
  created_at: string;
  last_triggered_at?: string | null;
  muted_until?: string | null;
}

export interface AlertEventRecord {
  id: string;
  rule_id?: string | null;
  symbol: string;
  severity: "info" | "warn" | "critical";
  title: string;
  detail: string;
  state: "open" | "acknowledged";
  payload: Record<string, unknown>;
  created_at: string;
  acknowledged_at?: string | null;
}

export type ActivitySignalType =
  | "volume_oi_spike"
  | "open_interest_change"
  | "atm_iv_jump"
  | "skew_shift"
  | "term_structure_kink"
  | "spread_normalization"
  | "short_dated_strike_cluster";

export interface ActivitySignalRecord {
  id: string;
  symbol: string;
  signal_type: ActivitySignalType;
  score: number;
  title: string;
  detail: string;
  snapshot_id?: string | null;
  payload: Record<string, unknown>;
  quality_flags: QualityFlag[];
  created_at: string;
}

export interface ArchiveCoverageRecord {
  symbol: string;
  start_at?: string | null;
  end_at?: string | null;
  snapshot_count: number;
  bar_count: number;
  snapshot_gap_count: number;
  bar_gap_count: number;
  largest_snapshot_gap_business_days: number;
  largest_bar_gap_business_days: number;
  snapshot_gaps: ArchiveGapWindowRecord[];
  bar_gaps: ArchiveGapWindowRecord[];
  quality_flags: QualityFlag[];
  data_provenance: Record<string, unknown>;
}

export interface ArchiveGapWindowRecord {
  series: string;
  gap_started_after: string;
  resumes_at: string;
  calendar_gap_days: number;
  missing_business_days: number;
}

export interface ArchiveImportJobRecord {
  id: string;
  status: string;
  job_type: string;
  payload: Record<string, unknown>;
  data_provenance: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BacktestConfig {
  symbol_universe: string[];
  template_strategy: StrategyName;
  entry_schedule: string;
  target_dte: number;
  delta_target?: number | null;
  spread_width?: number | null;
  profit_target_pct?: number | null;
  stop_loss_pct?: number | null;
  days_before_expiry_exit?: number | null;
  max_concurrent_positions: number;
  position_risk_pct: number;
  require_liquidity_filters: boolean;
}

export interface BacktestMetricSet {
  total_return: number;
  cagr: number;
  max_drawdown: number;
  sharpe: number;
  sortino: number;
  win_rate: number;
  average_holding_period_days: number;
  average_pnl_per_trade: number;
  liquidity_skip_rate: number;
  exposure_by_strategy: Record<string, number>;
}

export interface BacktestTradeRecord {
  id: string;
  symbol: string;
  strategy_name: StrategyName;
  opened_at: string;
  closed_at?: string | null;
  pnl: number;
  detail: string;
}

export interface BacktestEquityPointRecord {
  as_of_utc: string;
  equity: number;
  drawdown: number;
}

export interface BacktestRunRecord {
  id: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  config: BacktestConfig;
  metrics: BacktestMetricSet;
  data_provenance: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BacktestReplayFidelityRecord {
  symbols_requested: number;
  symbols_with_minimum_snapshot_coverage: number;
  symbols_with_candidate_windows: number;
  symbols_with_executed_trades: number;
  total_snapshot_count: number;
  total_candidate_windows: number;
  executed_trade_count: number;
  skipped_candidate_count: number;
  symbol_coverage_rate: number;
  execution_rate: number;
  earliest_snapshot_at?: string | null;
  latest_snapshot_at?: string | null;
  largest_snapshot_gap_business_days: number;
}

export interface BacktestReplaySymbolCoverageRecord {
  symbol: string;
  snapshot_count: number;
  distinct_snapshot_days: number;
  candidate_window_count: number;
  executed_trade_count: number;
  skipped_candidate_count: number;
  minimum_snapshot_coverage: boolean;
  first_snapshot_at?: string | null;
  last_snapshot_at?: string | null;
  snapshot_span_days: number;
  snapshot_gap_count: number;
  largest_snapshot_gap_business_days: number;
}

export interface BacktestRunResultsRecord {
  run: BacktestRunRecord;
  events: Array<{
    event_type: string;
    payload: Record<string, unknown>;
    created_at: string;
  }>;
  trades: BacktestTradeRecord[];
  equity_curve: BacktestEquityPointRecord[];
}

export interface RLDatasetRecord {
  id: string;
  name: string;
  symbol_universe: string[];
  status: "queued" | "running" | "completed" | "failed";
  feature_count: number;
  row_count: number;
  data_provenance: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RLValidationReportRecord {
  total_return: number;
  max_drawdown: number;
  sharpe: number;
  minimum_trade_count_passed: boolean;
  risk_violation_free: boolean;
  approved_candidate: boolean;
}

export interface RLTrainingRunRecord {
  id: string;
  dataset_id: string;
  algorithm: string;
  status: "queued" | "running" | "completed" | "failed";
  validation_report: RLValidationReportRecord;
  created_at: string;
  updated_at: string;
}

export interface RLModelArtifactRecord {
  id: string;
  training_run_id: string;
  name: string;
  status: "draft" | "approved" | "archived";
  artifact_path?: string | null;
  created_at: string;
}

export interface RLSignalRecord {
  id: string;
  symbol: string;
  model_artifact_id: string;
  action_label: string;
  confidence: number;
  detail: string;
  created_at: string;
}

export interface WebSocketEventEnvelope {
  topic: string;
  event_type: string;
  occurred_at: string;
  payload: Record<string, unknown>;
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function buildOptionSnapshotQuery(params: {
  forceRefresh?: boolean;
  snapshotId?: string;
  source?: MarketDataSource;
}) {
  const query = new URLSearchParams();
  if (params.forceRefresh != null) {
    query.set("force_refresh", String(params.forceRefresh));
  }
  if (params.snapshotId) {
    query.set("snapshot_id", params.snapshotId);
  }
  if (params.source) {
    query.set("source", params.source);
  }
  const suffix = query.toString();
  return suffix ? `?${suffix}` : "";
}

export const api = {
  getWatchlist: () => request<{ symbols: string[] }>("/settings/watchlist"),
  getProviderHealth: () =>
    request<{ providers: ProviderHealthRecord[] }>("/providers/health"),
  getProviderOptionsActivityContract: (symbol: string) =>
    request<OptionsActivityProviderContractRecord>(`/providers/options-activity/${symbol}`),
  getProviderFundamentalsContract: (symbol: string) =>
    request<FundamentalsProviderContractRecord>(`/providers/fundamentals/${symbol}`),
  getProviderSentimentContract: (symbol: string) =>
    request<SentimentProviderContractRecord>(`/providers/sentiment/${symbol}`),
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
    request<BackgroundJobTriggerResponse>(`/providers/background-jobs/${jobName}/run`, {
      method: "POST",
    }),
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
    request<{ results: Record<string, OptionChainSnapshot>; errors: Record<string, string> }>(
      "/options/chain/batch",
      { method: "POST", body: JSON.stringify({ symbols }) },
    ),
  getTermStructure: (
    symbol: string,
    snapshotId?: string,
    source?: MarketDataSource,
  ) =>
    request<VolTermStructureResponse>(
      `/options/term-structure/${symbol}${buildOptionSnapshotQuery({ snapshotId, source })}`,
    ),
  getSurface: (
    symbol: string,
    snapshotId?: string,
    source?: MarketDataSource,
  ) =>
    request<VolSurfaceResponse>(
      `/options/surface/${symbol}${buildOptionSnapshotQuery({ snapshotId, source })}`,
    ),
  getNews: (symbol: string) => request<NewsItem[]>(`/options/news/${symbol}`),
  getActivity: (symbol: string, snapshotId?: string) =>
    request<ActivitySignalRecord[]>(
      `/options/activity/${symbol}${snapshotId ? `?snapshot_id=${snapshotId}` : ""}`,
    ),
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
  evaluateStrategy: (body: StrategyEvaluationRequest) =>
    request<StrategyEvaluation>("/strategies/evaluate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createPaperTrade: (body: PaperTradeCreateRequest) =>
    request<PaperTradeRecord>("/paper-trades", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listPaperTrades: () => request<PaperTradeRecord[]>("/paper-trades"),
  getPortfolioAccount: () => request<PortfolioAccountRecord>("/portfolio/account"),
  getPortfolioPositions: () => request<PortfolioPositionRecord[]>("/portfolio/positions"),
  getPortfolioExposure: () => request<PortfolioExposureRecord>("/portfolio/exposure"),
  listPortfolioActivityImports: () =>
    request<PortfolioActivityImportHistoryItemRecord[]>("/portfolio/activity-imports"),
  getPortfolioActivityImportRows: (fingerprint: string, rowNumbers: number[] = []) => {
    const query = rowNumbers.length
      ? `?${rowNumbers.map((rowNumber) => `row_numbers=${encodeURIComponent(String(rowNumber))}`).join("&")}`
      : "";
    return request<PortfolioActivityImportLineageRecord>(
      `/portfolio/activity-imports/${fingerprint}/rows${query}`,
    );
  },
  rollbackPortfolioActivityImport: (fingerprint: string) =>
    request<PortfolioActivityImportRollbackResultRecord>(`/portfolio/activity-imports/${fingerprint}`, {
      method: "DELETE",
    }),
  previewPortfolioActivityImport: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<PortfolioActivityImportPreviewRecord>("/portfolio/activity-imports/preview", {
      method: "POST",
      body: formData,
    });
  },
  importPortfolioActivity: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<PortfolioActivityImportResultRecord>("/portfolio/activity-imports", {
      method: "POST",
      body: formData,
    });
  },
  createPositionFromPaperTrade: (paperTradeId: string) =>
    request<PortfolioPositionRecord>(`/portfolio/positions/from-paper-trade/${paperTradeId}`, {
      method: "POST",
    }),
  closePortfolioPosition: (positionId: string) =>
    request<PortfolioPositionRecord>(`/portfolio/positions/${positionId}/close`, {
      method: "POST",
    }),
  getExpirationCalendar: () =>
    request<ExpirationCalendarItemRecord[]>("/portfolio/expiration-calendar"),
  // Phase C: Portfolio Risk Analytics
  getRegimeDecomposition: () =>
    request<RegimeDecomposition>("/portfolio/risk/regime-decomposition"),
  getEventDecomposition: () =>
    request<EventDecomposition>("/portfolio/risk/event-decomposition"),
  getStrategyConcentration: () =>
    request<StrategyConcentration>("/portfolio/risk/strategy-concentration"),
  calculateWhatIfScenario: (underlyingMovePct: number, ivShiftPct: number) =>
    request<WhatIfOverlayResult>(
      `/portfolio/risk/what-if?underlying_move_pct=${encodeURIComponent(String(underlyingMovePct))}&iv_shift_pct=${encodeURIComponent(String(ivShiftPct))}`,
      { method: "POST" },
    ),
  getCorrelationMatrix: (lookbackDays?: number) => {
    const query = lookbackDays ? `?lookback_days=${lookbackDays}` : "";
    return request<CorrelationMatrixData>(`/portfolio/risk/correlation-matrix${query}`);
  },
  getWatchlists: () => request<WatchlistRecord[]>("/watchlists"),
  getScannerScreens: () => request<StrategyScreenRecord[]>("/scanners/screens"),
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
    request<StrategyScreenRunRecord>(`/scanners/screens/${screenId}/runs`, {
      method: "POST",
    }),
  getScannerRun: (runId: string) =>
    request<StrategyScreenRunRecord>(`/scanners/runs/${runId}`),
  getFactorSnapshot: (symbol: string, snapshotId?: string, forceRefresh = false) =>
    request<FactorSnapshotRecord>(
      `/factors/${symbol}?force_refresh=${forceRefresh}${
        snapshotId ? `&snapshot_id=${snapshotId}` : ""
      }`,
    ),
  getFactorSnapshotById: (factorSnapshotId: string) =>
    request<FactorSnapshotRecord>(`/factors/snapshots/${factorSnapshotId}`),
  getFactorHistory: (symbol: string, limit = 20) =>
    request<FactorSnapshotRecord[]>(`/factors/${symbol}/history?limit=${limit}`),
  getRegimeSnapshot: (symbol: string, snapshotId?: string, forceRefresh = false) =>
    request<RegimeSnapshotRecord>(
      `/regimes/${symbol}?force_refresh=${forceRefresh}${
        snapshotId ? `&snapshot_id=${snapshotId}` : ""
      }`,
    ),
  getRegimeSnapshotById: (regimeSnapshotId: string) =>
    request<RegimeSnapshotRecord>(`/regimes/snapshots/${regimeSnapshotId}`),
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
    request<EventBriefSummaryRecord[]>(`/events/calendar/${itemId}/briefs`),
  refreshEventBrief: (itemId: string) =>
    request<EventBriefRecord>(`/events/calendar/${itemId}/briefs/refresh`, {
      method: "POST",
    }),
  getEventBrief: (briefId: string) =>
    request<EventBriefRecord>(`/events/briefs/${briefId}`),
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
    request<ResearchNotebookDetailRecord>(`/research/notebooks/${notebookId}`),
  getResearchBriefVersions: (notebookId: string) =>
    request<ResearchBriefSummaryRecord[]>(`/research/notebooks/${notebookId}/briefs`),
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
  getResearchTasks: (params?: { notebook_id?: string | null; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.notebook_id) query.set("notebook_id", params.notebook_id);
    if (params?.limit) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<ResearchTaskRecord[]>(`/research/tasks${suffix}`);
  },
  getResearchTask: (taskId: string) =>
    request<ResearchTaskRecord>(`/research/tasks/${taskId}`),
  getResearchTaskEvents: (taskId: string) =>
    request<ResearchTaskEventRecord[]>(`/research/tasks/${taskId}/events`),
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
    if (params?.strategy_name) query.set("strategy_name", params.strategy_name);
    if (params?.event_type) query.set("event_type", params.event_type);
    if (params?.source_type) query.set("source_type", params.source_type);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<CalibrationScorecardRecord>(`/forecasts/scorecard${suffix}`);
  },
  getTradeReviews: () => request<TradeReviewRecord[]>("/reviews"),
  getTradeReview: (paperTradeId: string) =>
    request<TradeReviewRecord>(`/reviews/paper-trades/${paperTradeId}`),
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
    request<void>(`/watchlists/${watchlistId}`, {
      method: "DELETE",
    }),
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
  addWatchlistItem: (watchlistId: string, body: { symbol: string; notes?: string | null }) =>
    request<WatchlistRecord>(`/watchlists/${watchlistId}/items`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  removeWatchlistItem: (watchlistId: string, symbol: string) =>
    request<WatchlistRecord>(`/watchlists/${watchlistId}/items/${symbol}`, {
      method: "DELETE",
    }),
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
  listBacktestRuns: () => request<BacktestRunRecord[]>("/backtests/runs"),
  createBacktestRun: (body: BacktestConfig) =>
    request<BacktestRunRecord>("/backtests/runs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getBacktestRun: (runId: string) =>
    request<BacktestRunRecord>(`/backtests/runs/${runId}`),
  getBacktestResults: (runId: string) =>
    request<BacktestRunResultsRecord>(`/backtests/runs/${runId}/results`),
  cancelBacktestRun: (runId: string) =>
    request<BacktestRunRecord>(`/backtests/runs/${runId}/cancel`, {
      method: "POST",
    }),
  createRLDataset: (body: { name: string; symbol_universe: string[] }) =>
    request<RLDatasetRecord>("/research/rl/datasets", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listRLDatasets: () => request<RLDatasetRecord[]>("/research/rl/datasets"),
  createRLTrainingRun: (body: { dataset_id: string; algorithm?: string }) =>
    request<RLTrainingRunRecord>("/research/rl/training-runs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listRLTrainingRuns: () =>
    request<RLTrainingRunRecord[]>("/research/rl/training-runs"),
  getRLTrainingRun: (runId: string) =>
    request<RLTrainingRunRecord>(`/research/rl/training-runs/${runId}`),
  listRLModels: () => request<RLModelArtifactRecord[]>("/research/rl/models"),
  approveRLModel: (modelId: string) =>
    request<RLModelArtifactRecord>(`/research/rl/models/${modelId}/approve`, {
      method: "POST",
    }),
  archiveRLModel: (modelId: string) =>
    request<RLModelArtifactRecord>(`/research/rl/models/${modelId}/archive`, {
      method: "POST",
    }),
  getRLSignals: (symbol: string) =>
    request<RLSignalRecord[]>(`/research/rl/signals/${symbol}`),
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

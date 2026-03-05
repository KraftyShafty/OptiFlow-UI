// Common type aliases, enums, and base types used across multiple domains.

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

export type ActivitySignalType =
  | "volume_oi_spike"
  | "open_interest_change"
  | "atm_iv_jump"
  | "skew_shift"
  | "term_structure_kink"
  | "spread_normalization"
  | "short_dated_strike_cluster";

export interface Greeks {
  delta?: number | null;
  gamma?: number | null;
  theta?: number | null;
  vega?: number | null;
  rho?: number | null;
}

export interface Citation {
  title: string;
  url?: string | null;
  published_at_utc?: string | null;
}

export interface NewsItem {
  title: string;
  publisher?: string | null;
  url?: string | null;
  published_at_utc?: string | null;
  summary?: string | null;
}

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

export interface RouteTargetsRecord {
  review_href?: string | null;
  event_brief_href?: string | null;
  research_brief_href?: string | null;
  forecast_set_href?: string | null;
  factor_snapshot_href?: string | null;
  regime_snapshot_href?: string | null;
}

export interface WebSocketEventEnvelope {
  topic: string;
  event_type: string;
  occurred_at: string;
  payload: Record<string, unknown>;
}

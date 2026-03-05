// Watchlist, scanner, factor, and regime snapshot types.

import type {
  ActivitySignalRecord,
  QualityFlag,
  StrategyName,
  ScannerMode,
  TrendRegime,
  VolatilityRegime,
  LiquidityRegime,
  EventRegime,
} from "./common";

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

// Factor & Regime Snapshots

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

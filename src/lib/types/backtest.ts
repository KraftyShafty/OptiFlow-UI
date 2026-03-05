// Backtest, RL research, and archive types.

import type { QualityFlag, StrategyName } from "./common";

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

// RL Research

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

// Archive

export interface ArchiveGapWindowRecord {
  series: string;
  gap_started_after: string;
  resumes_at: string;
  calendar_gap_days: number;
  missing_business_days: number;
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

export interface ArchiveImportJobRecord {
  id: string;
  status: string;
  job_type: string;
  payload: Record<string, unknown>;
  data_provenance: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

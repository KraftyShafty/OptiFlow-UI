// Portfolio types: account, positions, lots, fills, exposure, imports, risk analytics.

import type {
  Greeks,
  OptionRight,
  PositionSide,
  QualityFlag,
  StrategyName,
} from "./common";
import type { PaperTradeRecord } from "./analysis";

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

// Portfolio Risk Analytics

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

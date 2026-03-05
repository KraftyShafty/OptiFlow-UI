// Event calendar and event brief types.

import type {
  Citation,
  EventBriefBuildStatus,
  EventScopeType,
  EventStatus,
  QualityFlag,
} from "./common";

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

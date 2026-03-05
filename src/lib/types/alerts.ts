// Alert rule and event types.

import type { StrategyName } from "./common";

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

// Strategy evaluation types: legs, scenarios, probability, pricing.

import type {
  Greeks,
  OptionRight,
  PositionSide,
  QualityFlag,
  StrategyName,
  Citation,
} from "./common";

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

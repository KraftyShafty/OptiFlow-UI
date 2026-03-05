// Forecast, calibration, and trade review types.

import type {
  Citation,
  ForecastContextType,
  ForecastResolutionBasis,
  ForecastSourceType,
  QualityFlag,
  RouteTargetsRecord,
  StrategyName,
} from "./common";
import type {
  EventContextSummaryRecord,
  ProbabilitySummaryRecord,
  StrategyEvaluation,
  StrategyEvaluationRequest,
  ForecastProfileRecord,
  WeightedOutcomeRecord,
} from "./strategy";
import type { EventBriefRecord } from "./events";
import type { ResearchBriefRecord } from "./research";
import type { FactorSnapshotRecord, RegimeSnapshotRecord } from "./watchlist";
import type { PaperTradeRecord } from "./analysis";

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

// Re-export strategy types needed for forecast creation API
export type {
  StrategyEvaluation,
  StrategyEvaluationRequest,
  ForecastProfileRecord,
};

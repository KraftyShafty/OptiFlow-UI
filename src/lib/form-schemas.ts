import { z } from "zod";

/* ─── Risk Profile ─── */
export const riskProfileSchema = z.object({
  max_position_size_pct: z.number().min(0.01).max(100),
  max_portfolio_delta: z.number().min(0).max(10000),
  max_single_name_pct: z.number().min(1).max(100),
  max_sector_pct: z.number().min(1).max(100),
  min_dte: z.number().int().min(0),
  max_dte: z.number().int().min(1),
  min_volume: z.number().int().min(0),
  min_open_interest: z.number().int().min(0),
  max_spread_pct: z.number().min(0).max(100),
  allowed_strategies: z.array(z.string()).min(1, "Select at least one strategy"),
});
export type RiskProfileForm = z.infer<typeof riskProfileSchema>;

/* ─── LLM Policy ─── */
export const llmPolicySchema = z.object({
  default_provider: z.string().min(1, "Select a provider"),
  default_model: z.string().min(1, "Select a model"),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().int().min(100).max(32000),
  comparison_mode: z.boolean(),
  fallback_provider: z.string().optional(),
  fallback_model: z.string().optional(),
  daily_cost_limit_usd: z.number().min(0).optional(),
});
export type LLMPolicyForm = z.infer<typeof llmPolicySchema>;

/* ─── Scanner Config ─── */
export const scannerConfigSchema = z.object({
  strategy: z.enum([
    "long_call", "long_put", "covered_call", "cash_secured_put",
    "bull_call_debit_spread", "bear_put_debit_spread",
    "put_credit_spread", "call_credit_spread",
    "iron_condor", "long_straddle",
  ]),
  universe: z.enum(["market_universe", "portfolio_holdings", "current_watchlist", "custom_symbols"]),
  custom_symbols: z.array(z.string()).optional(),
  use_risk_profile: z.boolean().default(true),
  event_window_filter: z.boolean().default(false),
  strict_liquidity: z.boolean().default(false),
});
export type ScannerConfigForm = z.infer<typeof scannerConfigSchema>;

/* ─── Backtest Config ─── */
export const backtestConfigSchema = z.object({
  strategy: z.string().min(1, "Select a strategy"),
  symbols: z.array(z.string()).min(1, "Add at least one symbol"),
  start_date: z.string().min(1, "Select a start date"),
  end_date: z.string().min(1, "Select an end date"),
  preset: z.string().optional(),
  initial_capital: z.number().min(1000).default(100000),
});
export type BacktestConfigForm = z.infer<typeof backtestConfigSchema>;

/* ─── Alert Rule ─── */
export const alertRuleSchema = z.object({
  symbol: z.string().min(1, "Enter a symbol"),
  rule_type: z.enum([
    "price_above", "price_below", "iv_above", "iv_below",
    "volume_above", "oi_above", "delta_above", "delta_below",
    "gamma_above", "theta_below", "vega_above", "spread_pct_above",
    "stale_data", "provider_drift", "activity_signal", "regime_change",
  ]),
  threshold: z.number().optional(),
  expiration: z.string().optional(),
});
export type AlertRuleForm = z.infer<typeof alertRuleSchema>;

/* ─── Paper Trade ─── */
export const paperTradeSchema = z.object({
  symbol: z.string().min(1),
  strategy: z.string().min(1),
  rationale: z.string().min(1, "Describe your rationale"),
  legs: z.array(z.object({
    contract_symbol: z.string(),
    side: z.enum(["buy", "sell"]),
    quantity: z.number().int().min(1),
    price: z.number().min(0),
  })).min(1, "Add at least one leg"),
  planned_exit: z.object({
    target_pnl_pct: z.number().optional(),
    stop_loss_pct: z.number().optional(),
    max_holding_days: z.number().int().optional(),
  }).optional(),
});
export type PaperTradeForm = z.infer<typeof paperTradeSchema>;

/* ─── Research Task ─── */
export const researchTaskSchema = z.object({
  notebook_id: z.string().min(1),
  task_type: z.enum(["refresh_sources", "generate_brief", "compare_briefs", "extract_contradictions"]),
  parameters: z.record(z.string(), z.unknown()).optional(),
});
export type ResearchTaskForm = z.infer<typeof researchTaskSchema>;

/* ─── Forecast Set ─── */
export const forecastSchema = z.object({
  symbol: z.string().min(1),
  context_type: z.enum([
    "strategy_evaluation", "lab_evaluation", "analysis_run",
    "event_brief", "paper_trade_entry",
  ]),
  context_id: z.string().min(1),
  questions: z.array(z.object({
    question_text: z.string().min(1),
    predictions: z.array(z.object({
      probability: z.number().min(0).max(1),
      source: z.string(),
      basis: z.string(),
    })),
  })).min(1),
});
export type ForecastForm = z.infer<typeof forecastSchema>;

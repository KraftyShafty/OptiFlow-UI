import type { StrategyName } from "@/lib/api";

export interface BacktestReplayPresetConfig {
  template_strategy: StrategyName;
  entry_schedule: "daily" | "snapshot";
  target_dte: number;
  position_risk_pct: number;
}

export interface BacktestReplayPreset {
  id: string;
  label: string;
  description: string;
  config: BacktestReplayPresetConfig;
}

export const BACKTEST_REPLAY_PRESETS: BacktestReplayPreset[] = [
  {
    id: "trend-debit",
    label: "Trend Debit",
    description: "Daily directional upside replay with defined debit risk.",
    config: {
      template_strategy: "bull_call_debit_spread",
      entry_schedule: "daily",
      target_dte: 30,
      position_risk_pct: 0.02,
    },
  },
  {
    id: "downside-hedge",
    label: "Downside Hedge",
    description: "Daily bearish replay tuned for shorter downside hedges.",
    config: {
      template_strategy: "bear_put_debit_spread",
      entry_schedule: "daily",
      target_dte: 21,
      position_risk_pct: 0.015,
    },
  },
  {
    id: "range-income",
    label: "Range Income",
    description: "Daily neutral income replay using wider-dated condors.",
    config: {
      template_strategy: "iron_condor",
      entry_schedule: "daily",
      target_dte: 45,
      position_risk_pct: 0.01,
    },
  },
  {
    id: "snapshot-gamma",
    label: "Snapshot Gamma",
    description: "Higher-cadence replay for short-dated long-volatility probes.",
    config: {
      template_strategy: "long_straddle",
      entry_schedule: "snapshot",
      target_dte: 14,
      position_risk_pct: 0.005,
    },
  },
];

export function findMatchingBacktestReplayPreset(
  config: BacktestReplayPresetConfig,
): BacktestReplayPreset | null {
  return (
    BACKTEST_REPLAY_PRESETS.find((preset) => {
      return (
        preset.config.template_strategy === config.template_strategy &&
        preset.config.entry_schedule === config.entry_schedule &&
        preset.config.target_dte === config.target_dte &&
        Math.abs(preset.config.position_risk_pct - config.position_risk_pct) < 0.0001
      );
    }) ?? null
  );
}

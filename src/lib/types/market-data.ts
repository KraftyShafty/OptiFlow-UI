// Market data types: quotes, chains, vol surfaces, term structures.

import type { Greeks, OptionRight, QualityFlag } from "./common";

export interface UnderlyingQuote {
  symbol: string;
  name?: string | null;
  last_price: number;
  previous_close?: number | null;
  dividend_yield?: number | null;
  as_of_utc: string;
  source: string;
  quality_flags: QualityFlag[];
}

export interface OptionContractQuote {
  contract_symbol: string;
  option_type: OptionRight;
  expiration: string;
  dte: number;
  strike: number;
  bid?: number | null;
  ask?: number | null;
  last_price?: number | null;
  mark?: number | null;
  volume?: number | null;
  open_interest?: number | null;
  implied_volatility?: number | null;
  greeks_source: string;
  greeks: Greeks;
  quality_flags: QualityFlag[];
}

export interface OptionChainSnapshot {
  snapshot_id: string;
  symbol: string;
  as_of_utc: string;
  market_time_zone: string;
  source: string;
  underlying: UnderlyingQuote;
  expirations: string[];
  contracts: OptionContractQuote[];
  quality_flags: QualityFlag[];
}

export interface VolTermPoint {
  expiration: string;
  dte: number;
  atm_iv: number;
  call_iv?: number | null;
  put_iv?: number | null;
  underlying_price: number;
  quality_flags: QualityFlag[];
}

export interface VolTermStructureResponse {
  snapshot_id: string;
  as_of_utc: string;
  source: string;
  points: VolTermPoint[];
  quality_flags: QualityFlag[];
}

export interface VolSurfacePoint {
  contract_symbol: string;
  expiration: string;
  dte: number;
  strike: number;
  moneyness_pct: number;
  implied_volatility: number;
  option_type: OptionRight;
}

export interface VolSurfaceGrid {
  moneyness_buckets: number[];
  dte_buckets: number[];
  z_values: Array<Array<number | null>>;
}

export interface VolSurfaceResponse {
  snapshot_id: string;
  as_of_utc: string;
  source: string;
  raw_points: VolSurfacePoint[];
  grid?: VolSurfaceGrid | null;
  interpolation_method?: string | null;
  quality_flags: QualityFlag[];
}

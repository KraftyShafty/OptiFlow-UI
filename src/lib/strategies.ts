import type {
  ForecastProfileRecord,
  OptionChainSnapshot,
  OptionContractQuote,
  StrategyEvaluationRequest,
  StrategyLegRequest,
  StrategyName,
} from "@/lib/api";

export const SUPPORTED_STRATEGIES: StrategyName[] = [
  "long_call",
  "long_put",
  "covered_call",
  "cash_secured_put",
  "bull_call_debit_spread",
  "bear_put_debit_spread",
  "put_credit_spread",
  "call_credit_spread",
  "iron_condor",
  "long_straddle",
];

export function serializeStrategyLegs(legs: StrategyLegRequest[]): string {
  return JSON.stringify(legs);
}

export function parseStrategyLegs(value: string | null): StrategyLegRequest[] | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const legs = parsed
      .filter(isStrategyLegRequest)
      .map((leg) => ({
        instrument_type: leg.instrument_type,
        side: leg.side,
        quantity: leg.quantity,
        contract_symbol: leg.contract_symbol,
        option_type: leg.option_type ?? null,
        expiration: leg.expiration ?? null,
        strike: leg.strike ?? null,
        entry_price: leg.entry_price,
        multiplier: leg.multiplier,
      }));
    return legs.length ? legs : null;
  } catch {
    return null;
  }
}

export function buildStrategyRequest(args: {
  symbol: string;
  chain: OptionChainSnapshot;
  strategyName: StrategyName;
  underlyingPriceOverride?: number | null;
  eventBriefId?: string | null;
  forecastProfile?: ForecastProfileRecord | null;
  useProbabilityWeighting?: boolean;
}): StrategyEvaluationRequest {
  const {
    symbol,
    chain,
    strategyName,
    underlyingPriceOverride,
    eventBriefId,
    forecastProfile,
    useProbabilityWeighting,
  } = args;
  const spot = chain.underlying.last_price;
  const expiration = pickExpiration(chain);

  const optionLeg = (
    contractSymbol: string,
    side: "long" | "short",
    quantity = 1,
  ): StrategyLegRequest => ({
    instrument_type: "option",
    side,
    quantity,
    contract_symbol: contractSymbol,
  });

  let legs: StrategyLegRequest[] = [];
  if (strategyName === "long_call") {
    legs = [optionLeg(pickContract(chain, expiration, "call", spot, "closest").contract_symbol, "long")];
  } else if (strategyName === "long_put") {
    legs = [optionLeg(pickContract(chain, expiration, "put", spot, "closest").contract_symbol, "long")];
  } else if (strategyName === "covered_call") {
    legs = [
      {
        instrument_type: "underlying",
        side: "long",
        quantity: 100,
        entry_price: spot,
        multiplier: 1,
      },
      optionLeg(pickContract(chain, expiration, "call", spot * 1.05, "above").contract_symbol, "short"),
    ];
  } else if (strategyName === "cash_secured_put") {
    legs = [optionLeg(pickContract(chain, expiration, "put", spot * 0.95, "below").contract_symbol, "short")];
  } else if (strategyName === "bull_call_debit_spread") {
    legs = [
      optionLeg(pickContract(chain, expiration, "call", spot, "closest").contract_symbol, "long"),
      optionLeg(pickContract(chain, expiration, "call", spot * 1.05, "above").contract_symbol, "short"),
    ];
  } else if (strategyName === "bear_put_debit_spread") {
    legs = [
      optionLeg(pickContract(chain, expiration, "put", spot, "closest").contract_symbol, "long"),
      optionLeg(pickContract(chain, expiration, "put", spot * 0.95, "below").contract_symbol, "short"),
    ];
  } else if (strategyName === "put_credit_spread") {
    legs = [
      optionLeg(pickContract(chain, expiration, "put", spot * 0.95, "below").contract_symbol, "short"),
      optionLeg(pickContract(chain, expiration, "put", spot * 0.9, "below").contract_symbol, "long"),
    ];
  } else if (strategyName === "call_credit_spread") {
    legs = [
      optionLeg(pickContract(chain, expiration, "call", spot * 1.05, "above").contract_symbol, "short"),
      optionLeg(pickContract(chain, expiration, "call", spot * 1.1, "above").contract_symbol, "long"),
    ];
  } else if (strategyName === "iron_condor") {
    legs = [
      optionLeg(pickContract(chain, expiration, "put", spot * 0.95, "below").contract_symbol, "short"),
      optionLeg(pickContract(chain, expiration, "put", spot * 0.9, "below").contract_symbol, "long"),
      optionLeg(pickContract(chain, expiration, "call", spot * 1.05, "above").contract_symbol, "short"),
      optionLeg(pickContract(chain, expiration, "call", spot * 1.1, "above").contract_symbol, "long"),
    ];
  } else {
    legs = [
      optionLeg(pickContract(chain, expiration, "call", spot, "closest").contract_symbol, "long"),
      optionLeg(pickContract(chain, expiration, "put", spot, "closest").contract_symbol, "long"),
    ];
  }

  return {
    symbol,
    as_of_snapshot_id: chain.snapshot_id,
    strategy_name: strategyName,
    legs,
    pricing_mode: "mid",
    event_brief_id: eventBriefId,
    forecast_profile: forecastProfile,
    use_probability_weighting: useProbabilityWeighting ?? true,
    underlying_price_override: underlyingPriceOverride,
  };
}

function pickExpiration(chain: OptionChainSnapshot) {
  return [...chain.expirations].sort(
    (left, right) => Math.abs(daysTo(left) - 30) - Math.abs(daysTo(right) - 30),
  )[0];
}

function daysTo(expiration: string) {
  const target = new Date(expiration);
  const today = new Date();
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function pickContract(
  chain: OptionChainSnapshot,
  expiration: string,
  optionType: "call" | "put",
  targetStrike: number,
  mode: "closest" | "above" | "below",
): OptionContractQuote {
  const candidates = chain.contracts.filter(
    (contract) =>
      contract.expiration === expiration && contract.option_type === optionType,
  );
  if (!candidates.length) {
    throw new Error(`No ${optionType} contracts found for ${expiration}.`);
  }
  if (mode === "above") {
    const filtered = candidates.filter((item) => item.strike >= targetStrike);
    if (filtered.length) {
      return filtered.sort((left, right) => left.strike - right.strike)[0];
    }
  }
  if (mode === "below") {
    const filtered = candidates.filter((item) => item.strike <= targetStrike);
    if (filtered.length) {
      return filtered.sort(
        (left, right) => Math.abs(left.strike - targetStrike) - Math.abs(right.strike - targetStrike),
      )[0];
    }
  }
  return candidates.sort(
    (left, right) => Math.abs(left.strike - targetStrike) - Math.abs(right.strike - targetStrike),
  )[0];
}

function isStrategyLegRequest(value: unknown): value is StrategyLegRequest {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const instrumentType = candidate.instrument_type;
  const side = candidate.side;
  const quantity = candidate.quantity;
  return (
    (instrumentType === "option" || instrumentType === "underlying") &&
    (side === "long" || side === "short") &&
    typeof quantity === "number"
  );
}

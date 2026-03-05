import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { QualityFlagList } from "@/components/shared/QualityFlagList";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useMutation } from "@tanstack/react-query";
import { api, type StrategyName, type StrategyLegRequest, type StrategyEvaluation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const templates: { value: StrategyName; label: string; buildLegs: (spot: number) => StrategyLegRequest[] }[] = [
  {
    value: "bull_call_debit_spread",
    label: "Bull Call Debit Spread",
    buildLegs: (spot) => [
      { instrument_type: "option", side: "long", quantity: 1, option_type: "call", strike: Math.round(spot - 5) },
      { instrument_type: "option", side: "short", quantity: 1, option_type: "call", strike: Math.round(spot + 5) },
    ],
  },
  {
    value: "iron_condor",
    label: "Iron Condor",
    buildLegs: (spot) => [
      { instrument_type: "option", side: "long", quantity: 1, option_type: "put", strike: Math.round(spot - 20) },
      { instrument_type: "option", side: "short", quantity: 1, option_type: "put", strike: Math.round(spot - 10) },
      { instrument_type: "option", side: "short", quantity: 1, option_type: "call", strike: Math.round(spot + 10) },
      { instrument_type: "option", side: "long", quantity: 1, option_type: "call", strike: Math.round(spot + 20) },
    ],
  },
  {
    value: "long_call",
    label: "Long Call",
    buildLegs: (spot) => [
      { instrument_type: "option", side: "long", quantity: 1, option_type: "call", strike: Math.round(spot) },
    ],
  },
  {
    value: "long_straddle",
    label: "Long Straddle",
    buildLegs: (spot) => [
      { instrument_type: "option", side: "long", quantity: 1, option_type: "call", strike: Math.round(spot) },
      { instrument_type: "option", side: "long", quantity: 1, option_type: "put", strike: Math.round(spot) },
    ],
  },
];

const StrategyLabPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [symbol, setSymbol] = useState("SPY");
  const [spotOverride, setSpotOverride] = useState("");
  const [result, setResult] = useState<StrategyEvaluation | null>(null);

  const evaluate = useMutation({
    mutationFn: () => {
      const tpl = templates[selectedTemplate];
      const spot = spotOverride ? parseFloat(spotOverride) : 587;
      return api.evaluateStrategy({
        symbol,
        strategy_name: tpl.value,
        legs: tpl.buildLegs(spot),
        pricing_mode: "mid",
        underlying_price_override: spotOverride ? parseFloat(spotOverride) : undefined,
      });
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Strategy evaluated successfully");
    },
    onError: () => toast.error("Failed to evaluate strategy"),
  });

  const tpl = templates[selectedTemplate];
  const spotPrice = result?.valuation_inputs.spot_price ?? (spotOverride ? parseFloat(spotOverride) : 587);
  const payoffData = result?.payoff_series.map((p) => ({ price: p.underlying_price, pnl: Math.round(p.value * 100) / 100 })) ?? [];
  const maxProfit = result?.max_profit;
  const maxLoss = result?.max_loss;
  const breakevens = result?.breakevens ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Strategy Lab</h1>

      <Panel ariaLabel="Strategy Selector">
        <h2 className="section-subtitle mb-3">Template</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {templates.map((s, i) => (
            <button
              key={s.value}
              onClick={() => { setSelectedTemplate(i); setResult(null); }}
              className={`rounded-pill px-4 py-1.5 text-sm font-mono ${i === selectedTemplate ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground border border-border hover:bg-secondary"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-28 font-mono"
          />
          <Input
            placeholder="Spot override"
            value={spotOverride}
            onChange={(e) => setSpotOverride(e.target.value)}
            className="w-36 font-mono"
            type="number"
          />
          <Button onClick={() => evaluate.mutate()} disabled={evaluate.isPending || !symbol} className="rounded-full">
            {evaluate.isPending ? "Evaluating…" : "Evaluate"}
          </Button>
        </div>
      </Panel>

      {evaluate.isPending && <LoadingState message="Evaluating strategy…" />}

      {result && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-2" ariaLabel="Payoff Chart">
              <h2 className="section-subtitle mb-3">Payoff at Expiration</h2>
              {payoffData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={payoffData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="price" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `$${v}`} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: 12 }} />
                    <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
                    <ReferenceLine x={spotPrice} stroke="var(--muted-foreground)" strokeDasharray="3 3" label={{ value: `$${spotPrice}`, fill: "var(--muted-foreground)", fontSize: 10 }} />
                    <Line type="monotone" dataKey="pnl" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No payoff data</p>
              )}
            </Panel>

            <div className="space-y-4">
              <Panel ariaLabel="Key Metrics">
                <h2 className="section-subtitle mb-3">Key Metrics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="micro-label">Max Profit</span>
                    <MonoValue value={maxProfit != null ? `$${maxProfit.toFixed(0)}` : "—"} positive className="font-bold" />
                  </div>
                  <div className="flex justify-between">
                    <span className="micro-label">Max Loss</span>
                    <MonoValue value={maxLoss != null ? `$${maxLoss.toFixed(0)}` : "—"} negative className="font-bold" />
                  </div>
                  <div className="flex justify-between">
                    <span className="micro-label">Capital at Risk</span>
                    <MonoValue value={result.capital_at_risk != null ? `$${result.capital_at_risk.toFixed(0)}` : "—"} className="text-xs" />
                  </div>
                  <div className="flex justify-between">
                    <span className="micro-label">Breakeven</span>
                    <MonoValue value={breakevens.length > 0 ? breakevens.map(b => `$${b.toFixed(1)}`).join(", ") : "N/A"} className="text-xs" />
                  </div>
                </div>
              </Panel>

              <Panel ariaLabel="Greeks">
                <h2 className="section-subtitle mb-3">Aggregate Greeks</h2>
                <div className="space-y-2">
                  {["delta", "gamma", "theta", "vega", "rho"].map((g) => (
                    <div key={g} className="flex justify-between">
                      <span className="micro-label capitalize">{g}</span>
                      <MonoValue
                        value={result.aggregate_greeks[g as keyof typeof result.aggregate_greeks] != null
                          ? (result.aggregate_greeks[g as keyof typeof result.aggregate_greeks] as number).toFixed(4)
                          : "—"}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel ariaLabel="Legs">
                <h2 className="section-subtitle mb-3">Legs</h2>
                <div className="space-y-2">
                  {result.per_leg.map((pl, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-2">
                      <span className={`text-xs font-mono font-medium ${pl.leg.side === "long" ? "text-success" : "text-destructive"}`}>
                        {pl.leg.side.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-foreground">{(pl.leg.option_type ?? "stock").toUpperCase()}</span>
                      <span className="text-xs font-mono text-muted-foreground">{pl.leg.strike ? `$${pl.leg.strike}` : "—"}</span>
                      <span className="text-xs font-mono text-muted-foreground">{pl.current_price != null ? `$${pl.current_price.toFixed(2)}` : ""}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          {/* Risk Warnings & Quality Flags */}
          {(result.risk_warnings.length > 0 || result.quality_flags.length > 0) && (
            <Panel ariaLabel="Warnings">
              {result.risk_warnings.length > 0 && (
                <div className="mb-3">
                  <h2 className="section-subtitle mb-2">Risk Warnings</h2>
                  <ul className="space-y-1">
                    {result.risk_warnings.map((w, i) => (
                      <li key={i} className="text-sm text-destructive/80 flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.quality_flags.length > 0 && (
                <QualityFlagList flags={result.quality_flags} />
              )}
            </Panel>
          )}
        </>
      )}

      {!result && !evaluate.isPending && (
        <Panel ariaLabel="Instructions" className="text-center py-12">
          <p className="text-muted-foreground">Select a template, enter a symbol, and click <strong>Evaluate</strong> to run the strategy analysis.</p>
        </Panel>
      )}
    </div>
  );
};

export default StrategyLabPage;

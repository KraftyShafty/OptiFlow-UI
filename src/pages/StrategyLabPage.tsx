import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { StrategyName } from "@/lib/api";

const strategies: { value: StrategyName; label: string; legs: { type: string; action: string; strikeOffset: number }[] }[] = [
  { value: "bull_call_debit_spread", label: "Bull Call Debit Spread", legs: [{ type: "call", action: "buy", strikeOffset: -5 }, { type: "call", action: "sell", strikeOffset: 5 }] },
  { value: "iron_condor", label: "Iron Condor", legs: [{ type: "put", action: "buy", strikeOffset: -20 }, { type: "put", action: "sell", strikeOffset: -10 }, { type: "call", action: "sell", strikeOffset: 10 }, { type: "call", action: "buy", strikeOffset: 20 }] },
  { value: "long_call", label: "Long Call", legs: [{ type: "call", action: "buy", strikeOffset: 0 }] },
  { value: "long_straddle", label: "Long Straddle", legs: [{ type: "call", action: "buy", strikeOffset: 0 }, { type: "put", action: "buy", strikeOffset: 0 }] },
];

const StrategyLabPage = () => {
  const [selectedStrategy, setSelectedStrategy] = useState(0);
  const strat = strategies[selectedStrategy];
  const underlying = 587;

  // Generate payoff data
  const payoffData = Array.from({ length: 50 }, (_, i) => {
    const price = underlying - 25 + i;
    let pnl = 0;
    if (strat.value === "bull_call_debit_spread") {
      const buyStrike = underlying + strat.legs[0].strikeOffset;
      const sellStrike = underlying + strat.legs[1].strikeOffset;
      pnl = Math.min(Math.max(price - buyStrike, 0), sellStrike - buyStrike) - 3.2;
    } else if (strat.value === "iron_condor") {
      const putBuy = underlying - 20, putSell = underlying - 10, callSell = underlying + 10, callBuy = underlying + 20;
      const putSpread = Math.max(putSell - price, 0) - Math.max(putBuy - price, 0);
      const callSpread = Math.max(price - callSell, 0) - Math.max(price - callBuy, 0);
      pnl = 4.8 - putSpread - callSpread;
    } else if (strat.value === "long_call") {
      pnl = Math.max(price - underlying, 0) - 5.6;
    } else {
      pnl = Math.max(price - underlying, 0) + Math.max(underlying - price, 0) - 11;
    }
    return { price, pnl: Math.round(pnl * 100) / 100 };
  });

  const maxProfit = Math.max(...payoffData.map(d => d.pnl));
  const maxLoss = Math.min(...payoffData.map(d => d.pnl));
  const breakevens = payoffData.filter((d, i) => i > 0 && (payoffData[i - 1].pnl < 0) !== (d.pnl < 0)).map(d => d.price);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Strategy Lab</h1>

      <Panel ariaLabel="Strategy Selector">
        <h2 className="section-subtitle mb-3">Template</h2>
        <div className="flex flex-wrap gap-2">
          {strategies.map((s, i) => (
            <button
              key={s.value}
              onClick={() => setSelectedStrategy(i)}
              className={`rounded-pill px-4 py-1.5 text-sm font-mono ${i === selectedStrategy ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground border border-border hover:bg-secondary"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" ariaLabel="Payoff Chart">
          <h2 className="section-subtitle mb-3">Payoff at Expiration</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={payoffData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 18%)" />
              <XAxis dataKey="price" tick={{ fontSize: 10, fill: "hsl(215 15% 50%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 50%)" }} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip contentStyle={{ background: "hsl(214 40% 9%)", border: "1px solid hsl(214 20% 18%)", borderRadius: "12px", fontSize: 12 }} />
              <ReferenceLine y={0} stroke="hsl(214 20% 30%)" strokeDasharray="3 3" />
              <ReferenceLine x={underlying} stroke="hsl(215 15% 50%)" strokeDasharray="3 3" label={{ value: `$${underlying}`, fill: "hsl(215 15% 50%)", fontSize: 10 }} />
              <Line type="monotone" dataKey="pnl" stroke="hsl(187 80% 69%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <div className="space-y-4">
          <Panel ariaLabel="Key Metrics">
            <h2 className="section-subtitle mb-3">Key Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="micro-label">Max Profit</span>
                <MonoValue value={`$${(maxProfit * 100).toFixed(0)}`} positive className="font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="micro-label">Max Loss</span>
                <MonoValue value={`$${(maxLoss * 100).toFixed(0)}`} negative className="font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="micro-label">Breakeven</span>
                <MonoValue value={breakevens.map(b => `$${b}`).join(", ") || "N/A"} className="text-xs" />
              </div>
            </div>
          </Panel>

          <Panel ariaLabel="Legs">
            <h2 className="section-subtitle mb-3">Legs</h2>
            <div className="space-y-2">
              {strat.legs.map((leg, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-2">
                  <span className={`text-xs font-mono font-medium ${leg.action === "buy" ? "text-success" : "text-destructive"}`}>
                    {leg.action.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-foreground">{leg.type.toUpperCase()}</span>
                  <span className="text-xs font-mono text-muted-foreground">${underlying + leg.strikeOffset}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default StrategyLabPage;

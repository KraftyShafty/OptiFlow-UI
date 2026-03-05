import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { QualityFlagList } from "@/components/shared/QualityFlagList";
import { RegimeBadge } from "@/components/shared/RegimeBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  api,
  type OptionContractQuote,
  type VolTermPoint,
} from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ChainExplorerPage = () => {
  const { ticker } = useParams();
  const symbol = ticker?.toUpperCase() || "SPY";
  const [selectedExp, setSelectedExp] = useState<string | null>(null);
  const [chainType, setChainType] = useState<"call" | "put">("call");

  const {
    data: snapshot,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chain", symbol],
    queryFn: () => api.getChain(symbol),
  });

  const { data: termStructure } = useQuery({
    queryKey: ["term-structure", symbol],
    queryFn: () => api.getTermStructure(symbol),
  });

  // Derive expiration list from snapshot
  const expirations = snapshot?.expirations ?? [];
  const activeExp = selectedExp ?? expirations[0] ?? "";

  // Filter contracts by type and expiration
  const filteredContracts = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.contracts.filter(
      (c: OptionContractQuote) =>
        c.option_type === chainType && c.expiration === activeExp,
    );
  }, [snapshot, chainType, activeExp]);

  const underlying = snapshot?.underlying;

  if (isLoading) return <LoadingState message={`Loading ${symbol} chain…`} />;
  if (error) return <ErrorState message={`Failed to load chain for ${symbol}.`} />;

  const changePct =
    underlying?.previous_close && underlying?.last_price
      ? ((underlying.last_price - underlying.previous_close) / underlying.previous_close) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">{symbol}</h1>
        {underlying && (
          <>
            <MonoValue value={`$${underlying.last_price.toFixed(2)}`} className="text-xl" />
            <MonoValue
              value={`${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`}
              positive={changePct > 0}
              negative={changePct < 0}
              className="text-lg"
            />
            <FreshnessBadge timestamp={underlying.as_of_utc} />
          </>
        )}
      </div>

      {/* Quality flags from snapshot */}
      {snapshot && snapshot.quality_flags.length > 0 && (
        <QualityFlagList flags={snapshot.quality_flags} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Option Chain */}
        <Panel className="lg:col-span-2" ariaLabel="Option Chain">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-subtitle">Option Chain</h2>
            <div className="flex gap-1">
              {(["call", "put"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChainType(t)}
                  className={`rounded-pill px-3 py-1 text-xs font-mono ${
                    chainType === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {t === "call" ? "Calls" : "Puts"}
                </button>
              ))}
            </div>
          </div>

          {/* Expiration tabs */}
          <div className="mb-3 flex gap-1 overflow-x-auto">
            {expirations.slice(0, 8).map((exp) => (
              <button
                key={exp}
                onClick={() => setSelectedExp(exp)}
                className={`rounded-pill px-3 py-1 text-xs font-mono whitespace-nowrap ${
                  activeExp === exp
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary/50 text-muted-foreground border border-border"
                }`}
              >
                {exp.slice(5)}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Strike", "Bid", "Ask", "Last", "IV", "Delta", "Gamma", "Theta", "Vega", "Vol", "OI"].map(
                    (h) => (
                      <th key={h} className="micro-label pb-2 text-right first:text-left">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-4 text-center text-sm text-muted-foreground">
                      No contracts for this expiration.
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((row: OptionContractQuote) => (
                    <tr key={row.contract_symbol} className="border-b border-border/30 hover:bg-secondary/20">
                      <td className="py-1.5 font-mono font-medium text-foreground">{row.strike}</td>
                      <td className="py-1.5 text-right font-mono">{row.bid?.toFixed(2) ?? "—"}</td>
                      <td className="py-1.5 text-right font-mono">{row.ask?.toFixed(2) ?? "—"}</td>
                      <td className="py-1.5 text-right font-mono">{row.last_price?.toFixed(2) ?? "—"}</td>
                      <td className="py-1.5 text-right font-mono">
                        {row.implied_volatility != null ? `${(row.implied_volatility * 100).toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-1.5 text-right font-mono">{row.greeks.delta?.toFixed(3) ?? "—"}</td>
                      <td className="py-1.5 text-right font-mono">{row.greeks.gamma?.toFixed(4) ?? "—"}</td>
                      <td className="py-1.5 text-right font-mono">{row.greeks.theta?.toFixed(3) ?? "—"}</td>
                      <td className="py-1.5 text-right font-mono">{row.greeks.vega?.toFixed(3) ?? "—"}</td>
                      <td className="py-1.5 text-right font-mono">{row.volume?.toLocaleString() ?? "—"}</td>
                      <td className="py-1.5 text-right font-mono">{row.open_interest?.toLocaleString() ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* IV Term Structure */}
        <Panel ariaLabel="IV Term Structure">
          <h2 className="section-subtitle mb-3">IV Term Structure</h2>
          {termStructure && termStructure.points.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={termStructure.points}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="expiration"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                  tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${(v * 100).toFixed(2)}%`, "ATM IV"]}
                />
                <Line
                  type="monotone"
                  dataKey="atm_iv"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No term structure data available.</p>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default ChainExplorerPage;

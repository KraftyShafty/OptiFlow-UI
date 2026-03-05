import { Panel } from "@/components/shared/Panel";
import { StatusPill } from "@/components/shared/StatusPill";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type BacktestTradeRecord,
} from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Area,
  AreaChart,
} from "recharts";

const BacktestRunDetailPage = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: results, isLoading, error } = useQuery({
    queryKey: ["backtest-run", runId],
    queryFn: () => api.getBacktestResults(runId!),
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.run.status;
      return status === "queued" || status === "running" ? 3000 : false;
    },
  });

  const cancelMut = useMutation({
    mutationFn: () => api.cancelBacktestRun(runId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backtest-run", runId] });
      queryClient.invalidateQueries({ queryKey: ["backtest-runs"] });
      toast.success("Backtest cancelled");
    },
    onError: () => toast.error("Failed to cancel backtest"),
  });

  if (isLoading) return <LoadingState message="Loading backtest results…" />;
  if (error || !results) return <ErrorState message="Failed to load backtest results." />;

  const { run, trades, equity_curve } = results;
  const m = run.metrics;

  const statusMap: Record<string, "completed" | "failed" | "active"> = {
    completed: "completed",
    failed: "failed",
    queued: "active",
    running: "active",
    cancelled: "failed",
  };

  // Compute drawdown series from equity curve
  const drawdownData = (() => {
    let peak = -Infinity;
    return equity_curve.map((pt) => {
      if (pt.equity > peak) peak = pt.equity;
      return { as_of_utc: pt.as_of_utc, dd: ((pt.equity - peak) / peak) * 100 };
    });
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/backtest")}>
            ← Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {run.config.template_strategy?.replace(/_/g, " ") ?? "Backtest Run"}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {run.id} · {run.config.symbol_universe?.join(", ")}
            </p>
          </div>
          <StatusPill status={statusMap[run.status] ?? "active"} />
          <FreshnessBadge timestamp={run.updated_at} />
        </div>
        {(run.status === "queued" || run.status === "running") && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => cancelMut.mutate()}
            disabled={cancelMut.isPending}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Metrics */}
      <Panel ariaLabel="Backtest Metrics">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          <MetricCell label="Total Return" value={`${(m.total_return * 100).toFixed(2)}%`} positive={m.total_return > 0} negative={m.total_return < 0} />
          <MetricCell label="CAGR" value={`${(m.cagr * 100).toFixed(2)}%`} positive={m.cagr > 0} />
          <MetricCell label="Max Drawdown" value={`${(m.max_drawdown * 100).toFixed(1)}%`} negative />
          <MetricCell label="Sharpe" value={m.sharpe.toFixed(2)} positive={m.sharpe > 1} />
          <MetricCell label="Sortino" value={m.sortino.toFixed(2)} positive={m.sortino > 1} />
          <MetricCell label="Win Rate" value={`${(m.win_rate * 100).toFixed(0)}%`} positive={m.win_rate > 0.5} />
          <MetricCell label="Avg Holding (d)" value={m.average_holding_period_days.toFixed(1)} />
          <MetricCell label="Avg PnL/Trade" value={`$${m.average_pnl_per_trade.toFixed(0)}`} positive={m.average_pnl_per_trade > 0} negative={m.average_pnl_per_trade < 0} />
          <MetricCell label="Liq Skip Rate" value={`${(m.liquidity_skip_rate * 100).toFixed(1)}%`} />
        </div>
      </Panel>

      <Tabs defaultValue="equity">
        <TabsList>
          <TabsTrigger value="equity">Equity Curve</TabsTrigger>
          <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
          <TabsTrigger value="trades">Trades ({trades.length})</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        {/* Equity Curve */}
        <TabsContent value="equity">
          <Panel ariaLabel="Equity Curve">
            {equity_curve.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {run.status === "running" ? "Backtest is still running…" : "No equity data available."}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={equity_curve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="as_of_utc"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                    labelFormatter={(v: string) => new Date(v).toLocaleDateString()}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, "Equity"]}
                  />
                  <Line type="monotone" dataKey="equity" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </TabsContent>

        {/* Drawdown */}
        <TabsContent value="drawdown">
          <Panel ariaLabel="Drawdown">
            {drawdownData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No drawdown data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={drawdownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="as_of_utc"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="dd" stroke="var(--destructive)" fill="hsl(0 72% 60% / 0.15)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </TabsContent>

        {/* Trades */}
        <TabsContent value="trades">
          <Panel ariaLabel="Trade Log">
            {trades.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trades recorded yet.</p>
            ) : (
              <>
                {/* PnL histogram */}
                <h3 className="section-subtitle mb-2">PnL Distribution</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={trades}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="symbol" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="pnl">
                      {trades.map((t, i) => (
                        <Cell key={i} fill={t.pnl >= 0 ? "var(--success)" : "var(--destructive)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Trade table */}
                <h3 className="section-subtitle mt-4 mb-2">Trade Log</h3>
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50 text-left text-muted-foreground">
                        <th className="p-2">Symbol</th>
                        <th className="p-2">Strategy</th>
                        <th className="p-2">Opened</th>
                        <th className="p-2">Closed</th>
                        <th className="p-2 text-right">PnL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((t: BacktestTradeRecord) => (
                        <tr key={t.id} className="border-b border-border/30 hover:bg-secondary/20">
                          <td className="p-2 font-mono">{t.symbol}</td>
                          <td className="p-2">{t.strategy_name.replace(/_/g, " ")}</td>
                          <td className="p-2">{new Date(t.opened_at).toLocaleDateString()}</td>
                          <td className="p-2">{t.closed_at ? new Date(t.closed_at).toLocaleDateString() : "—"}</td>
                          <td className={`p-2 text-right font-mono font-semibold ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            ${t.pnl.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Panel>
        </TabsContent>

        {/* Config */}
        <TabsContent value="config">
          <Panel ariaLabel="Run Configuration">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <ConfigLine label="Strategy" value={run.config.template_strategy?.replace(/_/g, " ") ?? "—"} />
              <ConfigLine label="Symbols" value={run.config.symbol_universe?.join(", ") ?? "—"} />
              <ConfigLine label="Entry Schedule" value={run.config.entry_schedule} />
              <ConfigLine label="Target DTE" value={String(run.config.target_dte)} />
              <ConfigLine label="Delta Target" value={run.config.delta_target != null ? String(run.config.delta_target) : "—"} />
              <ConfigLine label="Spread Width" value={run.config.spread_width != null ? String(run.config.spread_width) : "—"} />
              <ConfigLine label="Profit Target" value={run.config.profit_target_pct != null ? `${(run.config.profit_target_pct * 100).toFixed(0)}%` : "—"} />
              <ConfigLine label="Stop Loss" value={run.config.stop_loss_pct != null ? `${(run.config.stop_loss_pct * 100).toFixed(0)}%` : "—"} />
              <ConfigLine label="Max Concurrent" value={String(run.config.max_concurrent_positions)} />
              <ConfigLine label="Position Risk" value={`${(run.config.position_risk_pct * 100).toFixed(1)}%`} />
              <ConfigLine label="Liquidity Filters" value={run.config.require_liquidity_filters ? "Yes" : "No"} />
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ---------- small helpers ---------- */

function MetricCell({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div>
      <p className="micro-label">{label}</p>
      <MonoValue value={value} positive={positive} negative={negative} className="text-lg" />
    </div>
  );
}

function ConfigLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="micro-label">{label}</p>
      <p className="font-mono text-foreground">{value}</p>
    </div>
  );
}

export default BacktestRunDetailPage;

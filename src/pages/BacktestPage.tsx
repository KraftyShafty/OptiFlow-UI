import { Panel } from "@/components/shared/Panel";
import { StatusPill } from "@/components/shared/StatusPill";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type StrategyName, type BacktestRunRecord } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const strategies: { value: StrategyName; label: string }[] = [
  { value: "bull_call_debit_spread", label: "Bull Call Debit Spread" },
  { value: "iron_condor", label: "Iron Condor" },
  { value: "cash_secured_put", label: "Cash Secured Put" },
  { value: "covered_call", label: "Covered Call" },
  { value: "bear_put_debit_spread", label: "Bear Put Debit Spread" },
  { value: "put_credit_spread", label: "Put Credit Spread" },
  { value: "call_credit_spread", label: "Call Credit Spread" },
  { value: "long_call", label: "Long Call" },
  { value: "long_put", label: "Long Put" },
  { value: "long_straddle", label: "Long Straddle" },
];

const BacktestPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState<StrategyName>("bull_call_debit_spread");
  const [symbols, setSymbols] = useState("SPY, QQQ");

  const {
    data: runs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["backtest-runs"],
    queryFn: () => api.listBacktestRuns(),
  });

  const runBacktest = useMutation({
    mutationFn: () =>
      api.createBacktestRun({
        symbol_universe: symbols.split(",").map((s) => s.trim()).filter(Boolean),
        template_strategy: strategy,
        entry_schedule: "weekly",
        target_dte: 45,
        max_concurrent_positions: 3,
        position_risk_pct: 0.02,
        require_liquidity_filters: true,
      }),
    onSuccess: (run) => {
      queryClient.invalidateQueries({ queryKey: ["backtest-runs"] });
      toast.success("Backtest started");
      navigate(`/backtest/runs/${run.id}`);
    },
    onError: () => toast.error("Failed to start backtest"),
  });

  if (isLoading) return <LoadingState message="Loading backtests…" />;
  if (error) return <ErrorState message="Failed to load backtests." />;

  const sorted = [...(runs ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Backtest Workspace</h1>

      <Panel ariaLabel="New Backtest Configuration">
        <h2 className="section-subtitle mb-3">Configuration</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label>Strategy</Label>
            <Select value={strategy} onValueChange={(v) => setStrategy(v as StrategyName)}>
              <SelectTrigger className="w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Symbols</Label>
            <Input
              value={symbols}
              onChange={(e) => setSymbols(e.target.value.toUpperCase())}
              className="w-40"
            />
          </div>
          <Button
            onClick={() => runBacktest.mutate()}
            disabled={runBacktest.isPending}
            className="rounded-full"
          >
            {runBacktest.isPending ? "Starting…" : "Run Backtest"}
          </Button>
        </div>
      </Panel>

      {/* Recent Runs */}
      <Panel ariaLabel="Recent Runs">
        <h2 className="section-subtitle mb-3">Recent Runs</h2>
        {sorted.length === 0 ? (
          <EmptyState
            title="No backtests"
            description="Configure and run a backtest above."
          />
        ) : (
          <div className="space-y-2">
            {sorted.map((bt: BacktestRunRecord) => (
              <div
                key={bt.id}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-3 cursor-pointer hover:bg-secondary/40 transition-colors"
                onClick={() => navigate(`/backtest/runs/${bt.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-foreground">
                    {bt.config.strategy_name?.replace(/_/g, " ") ?? "Backtest"}
                  </span>
                  <StatusPill
                    status={
                      bt.status === "completed"
                        ? "completed"
                        : bt.status === "failed"
                          ? "failed"
                          : "active"
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {bt.config.symbols?.join(", ")}
                  </span>
                  <FreshnessBadge timestamp={bt.created_at} />
                </div>
                <div className="flex items-center gap-4">
                  {bt.metrics.sharpe_ratio != null && (
                    <MonoValue value={`SR ${bt.metrics.sharpe_ratio.toFixed(2)}`} className="text-xs" />
                  )}
                  {bt.metrics.max_drawdown_pct != null && (
                    <MonoValue
                      value={`DD ${(bt.metrics.max_drawdown_pct * 100).toFixed(1)}%`}
                      negative
                      className="text-xs"
                    />
                  )}
                  {bt.metrics.win_rate != null && (
                    <MonoValue value={`WR ${(bt.metrics.win_rate * 100).toFixed(0)}%`} className="text-xs" />
                  )}
                  {bt.metrics.total_pnl != null && (
                    <MonoValue
                      value={`$${bt.metrics.total_pnl.toFixed(0)}`}
                      positive={bt.metrics.total_pnl > 0}
                      negative={bt.metrics.total_pnl < 0}
                      className="text-xs font-bold"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

export default BacktestPage;

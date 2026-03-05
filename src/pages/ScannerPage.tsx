import { Panel } from "@/components/shared/Panel";
import { StatusPill } from "@/components/shared/StatusPill";
import { MonoValue } from "@/components/shared/MonoValue";
import { RegimeBadge } from "@/components/shared/RegimeBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type StrategyName,
  type ScannerMode,
  type StrategyScreenRecord,
  type ScannerCandidateRecord,
} from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const strategies: { value: StrategyName; label: string }[] = [
  { value: "bull_call_debit_spread", label: "Bull Call Debit Spread" },
  { value: "bear_put_debit_spread", label: "Bear Put Debit Spread" },
  { value: "iron_condor", label: "Iron Condor" },
  { value: "covered_call", label: "Covered Call" },
  { value: "cash_secured_put", label: "Cash Secured Put" },
  { value: "long_call", label: "Long Call" },
  { value: "long_put", label: "Long Put" },
  { value: "put_credit_spread", label: "Put Credit Spread" },
  { value: "call_credit_spread", label: "Call Credit Spread" },
  { value: "long_straddle", label: "Long Straddle" },
];

const ScannerPage = () => {
  const queryClient = useQueryClient();
  const [strategy, setStrategy] = useState<StrategyName>("bull_call_debit_spread");
  const [mode, setMode] = useState<ScannerMode>("current_watchlist");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const {
    data: screens,
    isLoading: screensLoading,
    error: screensError,
  } = useQuery({
    queryKey: ["scanner-screens"],
    queryFn: () => api.getScannerScreens(),
  });

  const {
    data: activeRun,
    isLoading: runLoading,
  } = useQuery({
    queryKey: ["scanner-run", activeRunId],
    queryFn: () => api.getScannerRun(activeRunId!),
    enabled: !!activeRunId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "queued" || status === "running" ? 2000 : false;
    },
  });

  const runScreen = useMutation({
    mutationFn: async () => {
      // First create a screen, then run it
      const screen = await api.createScannerScreen({
        strategy_name: strategy,
        mode,
        name: `${strategy} scan`,
      });
      const run = await api.runScannerScreen(screen.id);
      return run;
    },
    onSuccess: (run) => {
      setActiveRunId(run.id);
      queryClient.invalidateQueries({ queryKey: ["scanner-screens"] });
      toast.success("Scanner started");
    },
    onError: () => toast.error("Failed to start scanner"),
  });

  if (screensLoading) return <LoadingState message="Loading scanner…" />;
  if (screensError) return <ErrorState message="Failed to load scanner." />;

  const candidates = activeRun?.candidates ?? [];
  const funnelCounts = activeRun?.funnel_counts ?? {};
  const funnelStages = Object.entries(funnelCounts);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Strategy Scanner</h1>

      <Panel ariaLabel="Scanner Configuration">
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
            <Label>Universe</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as ScannerMode)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market_universe">Market Universe</SelectItem>
                <SelectItem value="portfolio_holdings">Portfolio Holdings</SelectItem>
                <SelectItem value="current_watchlist">Current Watchlist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => runScreen.mutate()}
            disabled={runScreen.isPending}
            className="rounded-full"
          >
            {runScreen.isPending ? "Starting…" : "Run Scan"}
          </Button>
        </div>
      </Panel>

      {activeRun && (
        <>
          {/* Status */}
          {(activeRun.status === "queued" || activeRun.status === "running") && (
            <Panel ariaLabel="Scanner Status">
              <div className="flex items-center gap-3">
                <StatusPill status="active" />
                <span className="text-sm text-foreground">
                  Scanner is {activeRun.status}…
                </span>
              </div>
            </Panel>
          )}

          {/* Funnel */}
          {funnelStages.length > 0 && (
            <Panel ariaLabel="Screening Funnel">
              <h2 className="section-subtitle mb-3">Screening Funnel</h2>
              <div className="flex items-center gap-2 overflow-x-auto">
                {funnelStages.map(([stage, count], i) => (
                  <div key={stage} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <MonoValue value={count} className="text-lg font-bold" />
                      <span className="micro-label">{stage}</span>
                    </div>
                    {i < funnelStages.length - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Results Table */}
          <Panel ariaLabel="Scanner Results">
            <h2 className="section-subtitle mb-3">
              Ranked Candidates ({candidates.length})
            </h2>
            {candidates.length === 0 && activeRun.status === "completed" ? (
              <EmptyState
                title="No candidates"
                description="No symbols passed the screening funnel for this strategy."
              />
            ) : candidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="micro-label pb-2">#</th>
                      <th className="micro-label pb-2">Symbol</th>
                      <th className="micro-label pb-2 text-right">Score</th>
                      <th className="micro-label pb-2 text-right">Δ Rank</th>
                      <th className="micro-label pb-2">Trend</th>
                      <th className="micro-label pb-2">Vol</th>
                      <th className="micro-label pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c: ScannerCandidateRecord) => {
                      const trendRegime = c.regime_snapshot?.trend_regime;
                      const volRegime = c.regime_snapshot?.volatility_regime;
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-border/30 hover:bg-secondary/20"
                        >
                          <td className="py-2 font-mono text-muted-foreground">
                            {c.rank}
                          </td>
                          <td className="py-2 font-mono font-medium text-foreground">
                            {c.symbol}
                          </td>
                          <td className="py-2 text-right">
                            <MonoValue
                              value={c.score.toFixed(0)}
                              positive={c.score >= 70}
                              negative={c.score < 50}
                              className="font-bold"
                            />
                          </td>
                          <td className="py-2 text-right">
                            {c.rank_delta != null && c.rank_delta !== 0 ? (
                              <MonoValue
                                value={`${c.rank_delta > 0 ? "▲" : "▼"} ${Math.abs(c.rank_delta)}`}
                                positive={c.rank_delta > 0}
                                negative={c.rank_delta < 0}
                                className="text-xs"
                              />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-2">
                            {trendRegime ? (
                              <RegimeBadge label="" value={trendRegime} />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-2">
                            {volRegime ? (
                              <RegimeBadge label="" value={volRegime} />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                            {c.notes ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Panel>
        </>
      )}

      {/* Previous Screens */}
      {(screens ?? []).length > 0 && (
        <Panel ariaLabel="Previous Screens">
          <h2 className="section-subtitle mb-3">Saved Screens</h2>
          <div className="space-y-2">
            {(screens ?? []).map((scr: StrategyScreenRecord) => (
              <div
                key={scr.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3 cursor-pointer hover:bg-secondary/40 transition-colors"
                onClick={() => {
                  if (scr.last_run_id) setActiveRunId(scr.last_run_id);
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-foreground">{scr.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {scr.strategy_name.replace(/_/g, " ")}
                  </span>
                  <span className="rounded-full bg-secondary/50 border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {scr.mode}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    api.runScannerScreen(scr.id).then((run) => {
                      setActiveRunId(run.id);
                      queryClient.invalidateQueries({ queryKey: ["scanner-screens"] });
                      toast.success("Re-running scanner");
                    });
                  }}
                >
                  Re-run
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default ScannerPage;

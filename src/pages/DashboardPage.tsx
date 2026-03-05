import { Panel } from "@/components/shared/Panel";
import { StatusPill } from "@/components/shared/StatusPill";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { MonoValue } from "@/components/shared/MonoValue";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { QualityFlagList } from "@/components/shared/QualityFlagList";
import { RegimeBadge } from "@/components/shared/RegimeBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TrendingUp, Activity, AlertTriangle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  const { data: watchlists, isLoading: wlLoading } = useQuery({
    queryKey: ["watchlists"],
    queryFn: () => api.getWatchlists(),
  });
  const { data: positions, isLoading: posLoading } = useQuery({
    queryKey: ["portfolio-positions"],
    queryFn: () => api.getPortfolioPositions(),
  });
  const { data: trades, isLoading: ptLoading } = useQuery({
    queryKey: ["paper-trades"],
    queryFn: () => api.listPaperTrades(),
  });
  const { data: alertEvents, isLoading: alLoading } = useQuery({
    queryKey: ["alert-events"],
    queryFn: () => api.getAlertEvents(),
    refetchInterval: 15_000,
  });
  const { data: backtests, isLoading: btLoading } = useQuery({
    queryKey: ["backtest-runs"],
    queryFn: () => api.listBacktestRuns(),
  });
  const { data: healthData } = useQuery({
    queryKey: ["provider-health"],
    queryFn: () => api.getProviderHealth(),
    refetchInterval: 30_000,
  });

  const anyLoading = wlLoading || posLoading || ptLoading || alLoading || btLoading;
  if (anyLoading) return <LoadingState message="Loading dashboard…" />;

  /* derived data */
  const defaultWl = (watchlists ?? []).find((w) => w.is_default) ?? (watchlists ?? [])[0];
  const wlItems = defaultWl?.items ?? [];
  const providers = healthData?.providers ?? [];
  const openPositions = (positions ?? []).filter((p) => p.state === "open");
  const nav = openPositions.reduce((s, p) => s + (p.current_mark ?? 0), 0);
  const openAlerts = (alertEvents ?? []).filter((e) => e.state === "open");
  const recentTrades = [...(trades ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const recentBt = [...(backtests ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold text-foreground">OptiFlow</h1>
        <p className="text-sm text-muted-foreground">
          Analyze liquid US options without pretending stale data is real-time.
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="micro-label">Tracked Symbols</p>
            <MonoValue value={wlItems.length} className="text-lg font-semibold" />
          </div>
        </Panel>
        <Panel className="flex items-center gap-3">
          <div className="rounded-lg bg-success/10 p-2">
            <Activity className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="micro-label">Portfolio NAV</p>
            <MonoValue value={`$${nav.toLocaleString()}`} className="text-lg font-semibold" />
          </div>
        </Panel>
        <Panel className="flex items-center gap-3">
          <div className="rounded-lg bg-caution/10 p-2">
            <AlertTriangle className="h-5 w-5 text-caution" />
          </div>
          <div>
            <p className="micro-label">Active Alerts</p>
            <MonoValue value={openAlerts.length} className="text-lg font-semibold" />
          </div>
        </Panel>
        <Panel className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2">
            <BarChart3 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="micro-label">Execution Mode</p>
            <span className="text-sm font-medium text-foreground">Advisory Only</span>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Watchlist Summary */}
        <Panel className="lg:col-span-2" ariaLabel="Watchlist Summary">
          <h2 className="section-subtitle mb-3">
            Watchlist{defaultWl ? ` — ${defaultWl.name}` : ""}
          </h2>
          {wlItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No symbols in watchlist.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="micro-label pb-2">Symbol</th>
                    <th className="micro-label pb-2 text-right">Price</th>
                    <th className="micro-label pb-2 text-right">Chg%</th>
                    <th className="micro-label pb-2 text-right">IV Rank</th>
                    <th className="micro-label pb-2">Trend</th>
                    <th className="micro-label pb-2">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {wlItems.map((item) => {
                    const sp = item.signal_payload;
                    const cc = item.chain_context;
                    const trendRegime = item.regime_snapshot?.trend_regime;
                    return (
                      <tr key={item.symbol} className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer" onClick={() => navigate(`/watchlist`)}>
                        <td className="py-2 font-mono font-medium text-foreground">{item.symbol}</td>
                        <td className="py-2 text-right">
                          <MonoValue value={cc?.underlying_price?.toFixed(2) ?? sp?.spot_price?.toFixed(2) ?? "—"} prefix="$" />
                        </td>
                        <td className="py-2 text-right">
                          <span className="text-muted-foreground">—</span>
                        </td>
                        <td className="py-2 text-right">
                          <MonoValue value={sp?.iv_rich_score?.toFixed(0) ?? "—"} />
                        </td>
                        <td className="py-2">
                          {trendRegime ? (
                            <RegimeBadge label="" value={trendRegime} />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2">
                          <QualityFlagList flags={cc?.quality_flags ?? []} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Provider Health */}
          <Panel ariaLabel="Provider Health">
            <h2 className="section-subtitle mb-3">Providers</h2>
            <div className="space-y-2">
              {providers.map((p) => (
                <div key={p.provider} className="flex items-center justify-between">
                  <StatusIndicator status={p.healthy ? "healthy" : "error"} label={p.provider} />
                  <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[100px]">
                    {p.detail}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Alert Feed */}
          <Panel ariaLabel="Recent Alerts">
            <h2 className="section-subtitle mb-3">Alerts</h2>
            <div className="space-y-2">
              {openAlerts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No open alerts</p>
              ) : (
                openAlerts.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-start gap-2 rounded-lg border border-border/50 bg-secondary/20 p-2">
                    <StatusPill status="active" className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-foreground truncate">{a.title}</p>
                      <FreshnessBadge timestamp={a.created_at} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Paper Trades */}
        <Panel ariaLabel="Recent Paper Trades">
          <h2 className="section-subtitle mb-3">Paper Trades</h2>
          <div className="space-y-2">
            {recentTrades.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No paper trades yet</p>
            ) : (
              recentTrades.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-foreground">{t.symbol}</span>
                    <StatusPill status={t.state === "open" ? "active" : "completed"} />
                    {t.strategy_name && (
                      <span className="text-xs text-muted-foreground">{t.strategy_name.replace(/_/g, " ")}</span>
                    )}
                  </div>
                  <MonoValue
                    value={`${(t.net_result ?? 0) >= 0 ? "+" : ""}$${(t.net_result ?? 0).toFixed(0)}`}
                    positive={(t.net_result ?? 0) > 0}
                    negative={(t.net_result ?? 0) < 0}
                  />
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* Recent Backtests */}
        <Panel ariaLabel="Recent Backtests">
          <h2 className="section-subtitle mb-3">Backtests</h2>
          <div className="space-y-2">
            {recentBt.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No backtests yet</p>
            ) : (
              recentBt.map((bt) => (
                <div key={bt.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground">
                      {bt.config.strategy_name?.replace(/_/g, " ") ?? "Backtest"}
                    </span>
                    <StatusPill
                      status={
                        bt.status === "completed" ? "completed" : bt.status === "failed" ? "failed" : "active"
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {bt.metrics.sharpe_ratio != null && (
                      <MonoValue value={`SR ${bt.metrics.sharpe_ratio.toFixed(2)}`} className="text-xs" />
                    )}
                    {bt.metrics.win_rate != null && (
                      <MonoValue value={`${(bt.metrics.win_rate * 100).toFixed(0)}%`} className="text-xs" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default DashboardPage;

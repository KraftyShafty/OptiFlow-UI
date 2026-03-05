import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { StatusPill } from "@/components/shared/StatusPill";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PortfolioPositionRecord } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const COLORS = [
  "hsl(263 50% 75%)",
  "hsl(25 95% 53%)",
  "hsl(187 80% 69%)",
  "hsl(215 25% 50%)",
  "hsl(142 52% 45%)",
  "hsl(0 62% 55%)",
];

const PortfolioPage = () => {
  const queryClient = useQueryClient();

  const {
    data: positions,
    isLoading: posLoading,
    error: posError,
  } = useQuery({
    queryKey: ["portfolio-positions"],
    queryFn: () => api.getPortfolioPositions(),
  });

  const {
    data: exposure,
    isLoading: expLoading,
    error: expError,
  } = useQuery({
    queryKey: ["portfolio-exposure"],
    queryFn: () => api.getPortfolioExposure(),
  });

  const closePosition = useMutation({
    mutationFn: (positionId: string) => api.closePortfolioPosition(positionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-positions"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-exposure"] });
      toast.success("Position closed");
    },
    onError: () => toast.error("Failed to close position"),
  });

  if (posLoading || expLoading) return <LoadingState message="Loading portfolio…" />;
  if (posError || expError) return <ErrorState message="Failed to load portfolio." />;

  const openPositions = (positions ?? []).filter((p) => p.state === "open");
  const closedPositions = (positions ?? []).filter((p) => p.state !== "open");
  const exp = exposure;

  const concEntries = Object.entries(exp?.concentration_by_symbol ?? {});
  const pieData = concEntries.map(([symbol, pct]) => ({ name: symbol, value: pct }));
  const greeks = exp?.aggregate_greeks;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Portfolio</h1>

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Panel>
          <p className="micro-label">NAV</p>
          <MonoValue value={`$${(exp?.nav ?? 0).toLocaleString()}`} className="text-xl font-bold" />
        </Panel>
        <Panel>
          <p className="micro-label">Cash</p>
          <MonoValue value={`$${(exp?.cash_balance ?? 0).toLocaleString()}`} className="text-xl font-bold" />
        </Panel>
        <Panel>
          <p className="micro-label">Unrealized P&L</p>
          <MonoValue
            value={`${(exp?.unrealized_pnl ?? 0) >= 0 ? "+" : ""}$${(exp?.unrealized_pnl ?? 0).toLocaleString()}`}
            positive={(exp?.unrealized_pnl ?? 0) > 0}
            negative={(exp?.unrealized_pnl ?? 0) < 0}
            className="text-xl font-bold"
          />
        </Panel>
        <Panel>
          <p className="micro-label">Realized P&L</p>
          <MonoValue
            value={`${(exp?.realized_pnl ?? 0) >= 0 ? "+" : ""}$${(exp?.realized_pnl ?? 0).toLocaleString()}`}
            positive={(exp?.realized_pnl ?? 0) > 0}
            negative={(exp?.realized_pnl ?? 0) < 0}
            className="text-xl font-bold"
          />
        </Panel>
        <Panel>
          <p className="micro-label">Short Premium</p>
          <MonoValue
            value={`$${(exp?.short_premium_exposure ?? 0).toLocaleString()}`}
            className="text-xl font-bold"
          />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Concentration Pie */}
        <Panel ariaLabel="Concentration">
          <SectionHeader title="Concentration" />
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  strokeWidth={0}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(214 40% 9%)",
                    border: "1px solid hsl(214 20% 18%)",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                  formatter={(val: number) => `${(val * 100).toFixed(1)}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No positions</p>
          )}
        </Panel>

        {/* Greeks */}
        <Panel ariaLabel="Portfolio Greeks" className="lg:col-span-2">
          <SectionHeader title="Portfolio Greeks" />
          {greeks ? (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 mt-3">
              {[
                { label: "Delta (Δ)", val: greeks.delta },
                { label: "Gamma (Γ)", val: greeks.gamma },
                { label: "Theta (Θ)", val: greeks.theta },
                { label: "Vega (ν)", val: greeks.vega },
                { label: "Rho (ρ)", val: greeks.rho },
              ].map((g) => (
                <div
                  key={g.label}
                  className="rounded-lg border border-border/50 bg-secondary/20 p-3 text-center"
                >
                  <p className="micro-label">{g.label}</p>
                  <MonoValue
                    value={g.val?.toFixed(3) ?? "—"}
                    positive={g.val != null && g.val > 0}
                    negative={g.val != null && g.val < 0}
                    className="text-lg font-bold"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No exposure data</p>
          )}
        </Panel>
      </div>

      {/* Expiration Calendar */}
      {(exp?.expiration_calendar ?? []).length > 0 && (
        <Panel ariaLabel="Expiration Calendar">
          <SectionHeader title="Expiration Calendar" />
          <div className="flex flex-wrap gap-2 mt-3">
            {exp!.expiration_calendar.map((item) => (
              <div
                key={`${item.position_id}-${item.expiration}`}
                className={`flex flex-col items-center rounded-lg border p-3 ${
                  item.short_exposure
                    ? "border-caution/30 bg-caution/10"
                    : "border-border/50 bg-secondary/20"
                }`}
              >
                <span className="font-mono text-xs text-foreground">{item.symbol}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{item.expiration}</span>
                <span className="font-mono text-xs text-muted-foreground">{item.dte}d</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Open Positions */}
      <Panel ariaLabel="Open Positions">
        <SectionHeader title={`Open Positions (${openPositions.length})`} />
        {openPositions.length === 0 ? (
          <EmptyState
            title="No open positions"
            description="Promote paper trades or import positions to see them here."
          />
        ) : (
          <div className="space-y-3 mt-3">
            {openPositions.map((pos: PortfolioPositionRecord) => (
              <div
                key={pos.id}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-foreground">{pos.symbol}</span>
                    <StatusPill status="active" />
                    {pos.strategy_name && (
                      <span className="text-xs text-muted-foreground">
                        {pos.strategy_name.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{pos.lots.length} lot(s)</span>
                    <span>{pos.fills.length} fill(s)</span>
                    <FreshnessBadge timestamp={pos.opened_at} />
                    {pos.capital_at_risk != null && (
                      <span>CaR: ${pos.capital_at_risk.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {pos.unrealized_pnl != null && (
                    <MonoValue
                      value={`${pos.unrealized_pnl >= 0 ? "+" : ""}$${pos.unrealized_pnl.toFixed(0)}`}
                      positive={pos.unrealized_pnl > 0}
                      negative={pos.unrealized_pnl < 0}
                      className="text-lg font-bold"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive"
                    onClick={() => closePosition.mutate(pos.id)}
                    disabled={closePosition.isPending}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Closed Positions */}
      {closedPositions.length > 0 && (
        <Panel ariaLabel="Closed Positions">
          <SectionHeader title={`Closed Positions (${closedPositions.length})`} />
          <div className="space-y-2 mt-3">
            {closedPositions.slice(0, 10).map((pos: PortfolioPositionRecord) => (
              <div
                key={pos.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-foreground">{pos.symbol}</span>
                  <StatusPill status="completed" />
                  {pos.strategy_name && (
                    <span className="text-xs text-muted-foreground">
                      {pos.strategy_name.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                {pos.realized_pnl != null && (
                  <MonoValue
                    value={`${pos.realized_pnl >= 0 ? "+" : ""}$${pos.realized_pnl.toFixed(0)}`}
                    positive={pos.realized_pnl > 0}
                    negative={pos.realized_pnl < 0}
                    className="font-bold"
                  />
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default PortfolioPage;

import { Panel } from "@/components/shared/Panel";
import { StatusPill } from "@/components/shared/StatusPill";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PaperTradeRecord } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const JournalPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: trades,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["paper-trades"],
    queryFn: () => api.listPaperTrades(),
  });

  const promote = useMutation({
    mutationFn: (paperTradeId: string) =>
      api.createPositionFromPaperTrade(paperTradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper-trades"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success("Trade promoted to portfolio position");
    },
    onError: () => toast.error("Failed to promote trade"),
  });

  if (isLoading) return <LoadingState message="Loading paper trades…" />;
  if (error) return <ErrorState message="Failed to load paper trades." />;

  const sorted = [...(trades ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Paper Trade Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sorted.length} trades ·{" "}
            {sorted.filter((t) => t.state === "open").length} open
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No paper trades"
          description="Paper trades are created from the Analyze page when you log a trade idea."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((trade: PaperTradeRecord) => (
            <Panel key={trade.id} ariaLabel={`Trade ${trade.symbol}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-foreground">
                      {trade.symbol}
                    </span>
                    <StatusPill
                      status={trade.state === "open" ? "active" : "completed"}
                    />
                    {trade.strategy_name && (
                      <span className="text-sm text-muted-foreground">
                        {trade.strategy_name.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 max-w-2xl">
                    {trade.thesis}
                  </p>
                  {trade.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {trade.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {trade.leg_resolutions.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {trade.leg_resolutions.map((leg, i) => (
                        <span
                          key={i}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${
                            leg.pnl >= 0
                              ? "border-success/30 text-success bg-success/10"
                              : "border-destructive/30 text-destructive bg-destructive/10"
                          }`}
                        >
                          {leg.label} {leg.outcome} {leg.pnl >= 0 ? "+" : ""}
                          ${leg.pnl.toFixed(0)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <MonoValue
                    value={`${(trade.net_result ?? 0) >= 0 ? "+" : ""}$${(trade.net_result ?? 0).toFixed(0)}`}
                    positive={(trade.net_result ?? 0) > 0}
                    negative={(trade.net_result ?? 0) < 0}
                    className="text-lg font-bold"
                  />
                  <FreshnessBadge timestamp={trade.created_at} />
                  <div className="flex gap-1 justify-end">
                    {trade.route_targets.review_href && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => navigate(trade.route_targets.review_href!)}
                      >
                        Review
                      </Button>
                    )}
                    {trade.state === "open" &&
                      !trade.linked_portfolio_position_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => promote.mutate(trade.id)}
                          disabled={promote.isPending}
                        >
                          Promote
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalPage;

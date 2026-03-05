import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { StatusPill } from "@/components/shared/StatusPill";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type TradeReviewRecord } from "@/lib/api";

const ReviewPage = () => {
  const navigate = useNavigate();

  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trade-reviews"],
    queryFn: () => api.getTradeReviews(),
  });

  if (isLoading) return <LoadingState message="Loading trade reviews…" />;
  if (error) return <ErrorState message="Failed to load trade reviews." />;

  const sorted = [...(reviews ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Trade Reviews</h1>

      {sorted.length === 0 ? (
        <EmptyState
          title="No trade reviews"
          description="Reviews are generated when paper trades are closed."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((rv: TradeReviewRecord) => {
            const pt = rv.paper_trade;
            const pnl = pt.net_result ?? 0;
            const isWin = pnl >= 0;

            return (
              <Panel
                key={rv.id}
                ariaLabel={`Review ${pt.symbol}`}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => navigate(`/review/${rv.paper_trade_id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-bold text-foreground">
                        {pt.symbol}
                      </span>
                      <StatusPill status={isWin ? "completed" : "failed"} />
                      {pt.strategy_name && (
                        <span className="text-xs text-muted-foreground">
                          {pt.strategy_name.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="micro-label">Created: <FreshnessBadge timestamp={rv.created_at} /></span>
                      {rv.forecast_brier_score != null && (
                        <span className="micro-label">
                          Brier: {rv.forecast_brier_score.toFixed(2)}
                        </span>
                      )}
                      <span className="micro-label">
                        Settled: {rv.settled_question_count}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-mono text-success">
                        {rv.supported_signals.length} supported
                      </span>
                      {rv.failed_signals.length > 0 && (
                        <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-mono text-destructive">
                          {rv.failed_signals.length} failed
                        </span>
                      )}
                    </div>
                  </div>
                  <MonoValue
                    value={`${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}`}
                    positive={pnl > 0}
                    negative={pnl < 0}
                    className="text-xl font-bold"
                  />
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewPage;

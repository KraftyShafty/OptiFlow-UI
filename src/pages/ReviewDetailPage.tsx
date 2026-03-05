import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { StatusPill } from "@/components/shared/StatusPill";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const ReviewDetailPage = () => {
  const { paperTradeId } = useParams<{ paperTradeId: string }>();

  const {
    data: review,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trade-review", paperTradeId],
    queryFn: () => api.getTradeReview(paperTradeId!),
    enabled: !!paperTradeId,
  });

  if (isLoading) return <LoadingState message="Loading review…" />;
  if (error || !review) return <ErrorState message="Failed to load trade review." />;

  const pt = review.paper_trade;
  const pnl = pt.net_result ?? 0;
  const isWin = pnl >= 0;
  const rt = review.route_targets;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/review" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Review: {pt.symbol}
          {pt.strategy_name && ` — ${pt.strategy_name.replace(/_/g, " ")}`}
        </h1>
        <StatusPill status={isWin ? "completed" : "failed"} />
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel>
          <p className="micro-label">P&L</p>
          <MonoValue
            value={`${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}`}
            positive={pnl > 0}
            negative={pnl < 0}
            className="text-xl font-bold"
          />
        </Panel>
        <Panel>
          <p className="micro-label">Brier Score</p>
          <MonoValue
            value={review.forecast_brier_score != null ? review.forecast_brier_score.toFixed(3) : "—"}
            className="text-xl font-bold"
          />
        </Panel>
        <Panel>
          <p className="micro-label">Settled Questions</p>
          <MonoValue value={String(review.settled_question_count)} className="text-xl font-bold" />
        </Panel>
        <Panel>
          <p className="micro-label">Signals</p>
          <MonoValue
            value={`${review.supported_signals.length} ✓ / ${review.failed_signals.length} ✗`}
            className="text-xl font-bold"
          />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Thesis Alignment */}
        <Panel ariaLabel="Thesis Alignment">
          <SectionHeader title="Thesis Alignment" />
          <p className="text-sm text-foreground/80 mt-3">{review.thesis_alignment}</p>
        </Panel>

        {/* Confidence Assessment */}
        <Panel ariaLabel="Confidence Assessment">
          <SectionHeader title="Confidence Assessment" />
          <p className="text-sm text-foreground/80 mt-3">{review.confidence_assessment}</p>
        </Panel>
      </div>

      {/* Signal Analysis */}
      <Panel ariaLabel="Signal Analysis">
        <SectionHeader title="Signal Analysis" />
        <div className="grid gap-2 sm:grid-cols-2 mt-3">
          {review.supported_signals.map((s, i) => (
            <div
              key={`s-${i}`}
              className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 p-3"
            >
              <span className="text-sm text-success">✓</span>
              <span className="text-sm text-foreground">{s}</span>
            </div>
          ))}
          {review.failed_signals.map((s, i) => (
            <div
              key={`f-${i}`}
              className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3"
            >
              <span className="text-sm text-destructive">✗</span>
              <span className="text-sm text-foreground">{s}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Forecast Accuracy Notes */}
      {review.forecast_accuracy_notes.length > 0 && (
        <Panel ariaLabel="Forecast Accuracy">
          <SectionHeader title="Forecast Accuracy" />
          <div className="space-y-2 mt-3">
            {review.forecast_accuracy_notes.map((note, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/50 bg-secondary/20 p-3 text-sm text-foreground/80"
              >
                {note}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Follow-up Actions */}
      {review.follow_up_actions.length > 0 && (
        <Panel ariaLabel="Follow-up Actions">
          <SectionHeader title="Follow-up Actions" />
          <ul className="list-disc list-inside mt-3 space-y-1 text-sm text-foreground/80">
            {review.follow_up_actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Panel>
      )}

      {/* Historical Context */}
      {review.historical_context && (
        <Panel ariaLabel="Historical Context">
          <SectionHeader title="Historical Context" />
          <p className="text-sm text-foreground/80 mt-3">{review.historical_context}</p>
        </Panel>
      )}

      {/* Context Navigation */}
      <div className="flex gap-2 flex-wrap">
        {rt.factor_snapshot_href && (
          <Link
            to={rt.factor_snapshot_href}
            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary hover:bg-primary/20"
          >
            Factor Snapshot →
          </Link>
        )}
        {rt.regime_snapshot_href && (
          <Link
            to={rt.regime_snapshot_href}
            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary hover:bg-primary/20"
          >
            Regime Snapshot →
          </Link>
        )}
        {rt.event_brief_href && (
          <Link
            to={rt.event_brief_href}
            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary hover:bg-primary/20"
          >
            Event Brief →
          </Link>
        )}
        {rt.research_brief_href && (
          <Link
            to={rt.research_brief_href}
            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary hover:bg-primary/20"
          >
            Research Brief →
          </Link>
        )}
        {rt.forecast_set_href && (
          <Link
            to={rt.forecast_set_href}
            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary hover:bg-primary/20"
          >
            Forecast Set →
          </Link>
        )}
      </div>
    </div>
  );
};

export default ReviewDetailPage;

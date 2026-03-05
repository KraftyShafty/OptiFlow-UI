import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const ForecastSetDetailPage = () => {
  const { forecastSetId } = useParams<{ forecastSetId: string }>();

  const {
    data: forecastSet,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["forecast-set", forecastSetId],
    queryFn: () => api.getForecastSet(forecastSetId!),
    enabled: !!forecastSetId,
  });

  if (isLoading) return <LoadingState message="Loading forecast set…" />;
  if (error || !forecastSet) return <ErrorState message="Failed to load forecast set." />;

  const favorable = forecastSet.weighted_outcomes.find((w) => w.scenario === "favorable");
  const neutral = forecastSet.weighted_outcomes.find((w) => w.scenario === "neutral");
  const adverse = forecastSet.weighted_outcomes.find((w) => w.scenario === "adverse");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/forecasts" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Forecast Set — {forecastSet.symbol}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            {forecastSet.id} · {forecastSet.context_type.replace(/_/g, " ")} ·{" "}
            <FreshnessBadge timestamp={forecastSet.created_at} />
          </p>
        </div>
      </div>

      {/* Weighted Outcomes Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel>
          <p className="micro-label">Favorable</p>
          <MonoValue
            value={favorable ? `${(favorable.probability * 100).toFixed(0)}%` : "—"}
            positive
            className="text-2xl font-bold"
          />
          {favorable && (
            <p className="text-xs text-muted-foreground mt-1">
              Payoff: ${favorable.weighted_payoff_at_expiry.toFixed(0)}
            </p>
          )}
        </Panel>
        <Panel>
          <p className="micro-label">Neutral</p>
          <MonoValue
            value={neutral ? `${(neutral.probability * 100).toFixed(0)}%` : "—"}
            className="text-2xl font-bold"
          />
          {neutral && (
            <p className="text-xs text-muted-foreground mt-1">
              Payoff: ${neutral.weighted_payoff_at_expiry.toFixed(0)}
            </p>
          )}
        </Panel>
        <Panel>
          <p className="micro-label">Adverse</p>
          <MonoValue
            value={adverse ? `${(adverse.probability * 100).toFixed(0)}%` : "—"}
            negative
            className="text-2xl font-bold"
          />
          {adverse && (
            <p className="text-xs text-muted-foreground mt-1">
              Payoff: ${adverse.weighted_payoff_at_expiry.toFixed(0)}
            </p>
          )}
        </Panel>
      </div>

      {/* Probability Summary */}
      {forecastSet.probability_summary && (
        <Panel ariaLabel="Probability Summary">
          <SectionHeader title="Probability Summary" />
          <div className="grid gap-3 sm:grid-cols-2 mt-4">
            {forecastSet.probability_summary.probability_of_profit != null && (
              <div className="flex justify-between items-center rounded-lg border border-border/50 bg-secondary/20 p-3">
                <span className="micro-label">P(Profit)</span>
                <MonoValue
                  value={`${(forecastSet.probability_summary.probability_of_profit * 100).toFixed(1)}%`}
                  className="text-lg font-bold"
                />
              </div>
            )}
            {forecastSet.probability_summary.expected_value != null && (
              <div className="flex justify-between items-center rounded-lg border border-border/50 bg-secondary/20 p-3">
                <span className="micro-label">Expected Value</span>
                <MonoValue
                  value={`$${forecastSet.probability_summary.expected_value.toFixed(0)}`}
                  positive={forecastSet.probability_summary.expected_value > 0}
                  negative={forecastSet.probability_summary.expected_value < 0}
                  className="text-lg font-bold"
                />
              </div>
            )}
            <div className="flex justify-between items-center rounded-lg border border-border/50 bg-secondary/20 p-3">
              <span className="micro-label">Confidence Band</span>
              <MonoValue
                value={forecastSet.probability_summary.confidence_band}
                className="text-lg font-bold"
              />
            </div>
          </div>
        </Panel>
      )}

      {/* Event Context */}
      {forecastSet.event_context_summary && (
        <Panel ariaLabel="Event Context">
          <SectionHeader title="Event Context" />
          <div className="flex items-center gap-4 mt-3 text-sm text-foreground/80">
            <span className="font-mono">{forecastSet.event_context_summary.event_type}</span>
            {forecastSet.event_context_summary.scheduled_at_utc && (
              <FreshnessBadge timestamp={forecastSet.event_context_summary.scheduled_at_utc} />
            )}
            {forecastSet.event_context_summary.expected_move_pct != null && (
              <span>
                Expected move: {(forecastSet.event_context_summary.expected_move_pct * 100).toFixed(1)}%
              </span>
            )}
          </div>
          {forecastSet.event_context_summary.risk_flags.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {forecastSet.event_context_summary.risk_flags.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-caution/30 bg-caution/10 px-2 py-0.5 text-[10px] font-mono text-caution"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* Questions */}
      <Panel ariaLabel="Forecast Questions">
        <SectionHeader title={`Questions (${forecastSet.questions.length})`} />
        <div className="space-y-4 mt-4">
          {forecastSet.questions.map((q) => {
            const pred = q.prediction;
            const outcome = q.outcome;

            return (
              <div key={q.id} className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  {q.question_type} — {q.subject_type}
                  {q.subject_id && ` (${q.subject_id})`}
                </p>
                <div className="flex items-center gap-4 mb-2">
                  {pred && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="micro-label">Prediction</span>
                        <MonoValue
                          value={`${(pred.probability * 100).toFixed(0)}%`}
                          className="text-lg font-bold text-primary"
                        />
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pred.probability * 100}%` }}
                        />
                      </div>
                    </>
                  )}
                  {outcome?.settled_value != null && (
                    <MonoValue
                      value={outcome.settled_value ? "✓ Correct" : "✗ Incorrect"}
                      positive={outcome.settled_value}
                      negative={!outcome.settled_value}
                    />
                  )}
                </div>
                {pred && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="rounded-full bg-secondary border border-border px-2 py-0.5 font-mono">
                      {pred.source_type}
                    </span>
                    <span className="truncate max-w-md">{pred.rationale_summary}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};

export default ForecastSetDetailPage;

import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useQuery } from "@tanstack/react-query";
import { api, type CalibrationScorecardRecord } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const ForecastsPage = () => {
  const navigate = useNavigate();

  const {
    data: scorecard,
    isLoading: scLoading,
    error: scError,
  } = useQuery({
    queryKey: ["forecast-scorecard"],
    queryFn: () => api.getForecastScorecard({}),
  });

  if (scLoading) return <LoadingState message="Loading forecast scorecard…" />;
  if (scError) return <ErrorState message="Failed to load forecast data." />;

  const sc = scorecard as CalibrationScorecardRecord | undefined;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Forecast Desk</h1>

      {/* Scorecard Summary */}
      {sc && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Panel>
              <p className="micro-label">Settled Predictions</p>
              <MonoValue value={String(sc.settled_prediction_count)} className="text-xl font-bold" />
            </Panel>
            <Panel>
              <p className="micro-label">Mean Brier Score</p>
              <MonoValue
                value={sc.mean_brier_score != null ? sc.mean_brier_score.toFixed(3) : "—"}
                className="text-xl font-bold"
              />
            </Panel>
            <Panel>
              <p className="micro-label">Hit Rate</p>
              <MonoValue
                value={sc.hit_rate != null ? `${(sc.hit_rate * 100).toFixed(1)}%` : "—"}
                className="text-xl font-bold"
              />
            </Panel>
            <Panel>
              <p className="micro-label">Buckets</p>
              <MonoValue value={String(sc.buckets.length)} className="text-xl font-bold" />
            </Panel>
          </div>

          {/* Calibration Buckets */}
          {sc.buckets.length > 0 && (
            <Panel ariaLabel="Calibration Buckets">
              <SectionHeader title="Calibration Buckets" />
              <div className="space-y-2 mt-4">
                {sc.buckets.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3"
                  >
                    <span className="font-mono text-sm text-foreground">{b.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{b.count} predictions</span>
                      <MonoValue
                        value={`Pred: ${(b.avg_predicted * 100).toFixed(0)}%`}
                        className="text-xs text-primary"
                      />
                      <MonoValue
                        value={`Actual: ${(b.avg_outcome * 100).toFixed(0)}%`}
                        className="text-xs"
                      />
                      <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${b.avg_outcome * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </>
      )}

      {!sc && (
        <EmptyState
          title="No forecast data"
          description="Run an analysis to generate forecasts that can be tracked here."
        />
      )}
    </div>
  );
};

export default ForecastsPage;

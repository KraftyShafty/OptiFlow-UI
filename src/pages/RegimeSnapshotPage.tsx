import { Panel } from "@/components/shared/Panel";
import { RegimeBadge } from "@/components/shared/RegimeBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/** Pretty-print a regime key for display. */
function regimeLabel(key: string): string {
  return key
    .replace(/_regime$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Pretty-print a regime value for display. */
function regimeValueLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const REGIME_KEYS = ["trend_regime", "volatility_regime", "liquidity_regime", "event_regime"] as const;

const RegimeSnapshotPage = () => {
  const { regimeSnapshotId } = useParams<{ regimeSnapshotId: string }>();
  const navigate = useNavigate();

  const { data: snapshot, isLoading, error } = useQuery({
    queryKey: ["regime-snapshot", regimeSnapshotId],
    queryFn: () => api.getRegimeSnapshotById(regimeSnapshotId!),
    enabled: !!regimeSnapshotId,
  });

  if (isLoading) return <LoadingState message="Loading regime snapshot…" />;
  if (error || !snapshot) return <ErrorState message="Failed to load regime snapshot." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Regime Snapshot</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {snapshot.symbol} · As of {snapshot.source_as_of_utc ?? "—"}
          </p>
        </div>
      </div>

      {/* Regime cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {REGIME_KEYS.map((key) => {
          const value = snapshot[key] as string;
          return (
            <Panel key={key} ariaLabel={`${regimeLabel(key)} Regime`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="section-subtitle">{regimeLabel(key)}</h2>
                <RegimeBadge label="" value={value} />
              </div>
              <p className="text-sm text-foreground/80 font-mono">
                {regimeValueLabel(value)}
              </p>
            </Panel>
          );
        })}
      </div>

      {/* Summary */}
      {snapshot.summary && (
        <Panel ariaLabel="Regime Summary">
          <h2 className="section-subtitle mb-3">Summary</h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{snapshot.summary}</p>
        </Panel>
      )}

      {/* Evidence */}
      {snapshot.evidence && Object.keys(snapshot.evidence).length > 0 && (
        <Panel ariaLabel="Evidence">
          <h2 className="section-subtitle mb-3">Evidence</h2>
          <div className="space-y-2">
            {Object.entries(snapshot.evidence).map(([key, val]) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="font-mono text-muted-foreground">{key}:</span>
                <span className="text-foreground/80">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default RegimeSnapshotPage;

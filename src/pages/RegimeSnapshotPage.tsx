import { Panel } from "@/components/shared/Panel";
import { RegimeBadge } from "@/components/shared/RegimeBadge";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const RegimeSnapshotPage = () => {
  const { regimeSnapshotId } = useParams<{ regimeSnapshotId: string }>();

  const { data: snapshot, isLoading, error } = useQuery({
    queryKey: ["regime-snapshot", regimeSnapshotId],
    queryFn: () => api.getRegimeSnapshotById(regimeSnapshotId!),
    enabled: !!regimeSnapshotId,
  });

  if (isLoading) return <LoadingState message="Loading regime snapshot…" />;
  if (error || !snapshot) return <ErrorState message="Failed to load regime snapshot." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Regime Snapshot</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">ID: {regimeSnapshotId}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {snapshot.symbol} · Captured {snapshot.captured_at ?? "—"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(snapshot.regimes ?? []).map((r) => (
          <Panel key={r.regime} ariaLabel={`${r.regime} Regime`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-subtitle">{r.regime}</h2>
              <RegimeBadge label="" value={r.classification} />
            </div>
            <div className="mb-4 flex items-center gap-3">
              <span className="micro-label">Confidence</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${r.confidence * 100}%` }} />
              </div>
              <MonoValue value={`${(r.confidence * 100).toFixed(0)}%`} className="text-xs" />
            </div>
            <div>
              <span className="micro-label mb-2 block">Evidence</span>
              <ul className="space-y-1.5">
                {(r.evidence ?? []).map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
};

export default RegimeSnapshotPage;

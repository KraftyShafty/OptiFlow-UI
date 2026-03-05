import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { QualityFlagList } from "@/components/shared/QualityFlagList";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const FactorSnapshotPage = () => {
  const { factorSnapshotId } = useParams<{ factorSnapshotId: string }>();

  const { data: snapshot, isLoading, error } = useQuery({
    queryKey: ["factor-snapshot", factorSnapshotId],
    queryFn: () => api.getFactorSnapshotById(factorSnapshotId!),
    enabled: !!factorSnapshotId,
  });

  if (isLoading) return <LoadingState message="Loading factor snapshot…" />;
  if (error || !snapshot) return <ErrorState message="Failed to load factor snapshot." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Factor Snapshot</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">ID: {factorSnapshotId}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {snapshot.symbol} · Captured {snapshot.captured_at ?? "—"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(snapshot.families ?? []).map((fam) => (
          <Panel key={fam.family} ariaLabel={`${fam.family} Factors`}>
            <h2 className="section-subtitle mb-4">{fam.family}</h2>
            <div className="space-y-3">
              {fam.factors.map((f) => (
                <div key={f.name} className="rounded-xl border border-border/50 bg-secondary/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{f.name}</span>
                    <MonoValue value={`${f.value}${f.unit ? ` ${f.unit}` : ""}`} className="text-sm font-bold" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${f.percentile}%` }}
                      />
                    </div>
                    <MonoValue value={`P${f.percentile}`} className="text-[10px] text-muted-foreground" />
                  </div>
                  <QualityFlagList flags={f.flags as string[]} className="mt-2" />
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
};

export default FactorSnapshotPage;

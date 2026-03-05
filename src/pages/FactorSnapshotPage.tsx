import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { QualityFlagList } from "@/components/shared/QualityFlagList";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type FactorValueRecord } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

/** Group a flat factors list by the `family` field. */
function groupByFamily(factors: FactorValueRecord[]) {
  const map = new Map<string, FactorValueRecord[]>();
  for (const f of factors) {
    const fam = f.family ?? "Other";
    if (!map.has(fam)) map.set(fam, []);
    map.get(fam)!.push(f);
  }
  return Array.from(map.entries()).map(([family, items]) => ({ family, factors: items }));
}

/** Map tone to a visual indicator colour class. */
function toneClass(tone?: string): string {
  switch (tone) {
    case "bullish":
    case "positive":
      return "text-success";
    case "bearish":
    case "negative":
      return "text-destructive";
    case "neutral":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
}

const FactorSnapshotPage = () => {
  const { factorSnapshotId } = useParams<{ factorSnapshotId: string }>();
  const navigate = useNavigate();

  const { data: snapshot, isLoading, error } = useQuery({
    queryKey: ["factor-snapshot", factorSnapshotId],
    queryFn: () => api.getFactorSnapshotById(factorSnapshotId!),
    enabled: !!factorSnapshotId,
  });

  const families = useMemo(() => groupByFamily(snapshot?.factors ?? []), [snapshot]);

  if (isLoading) return <LoadingState message="Loading factor snapshot…" />;
  if (error || !snapshot) return <ErrorState message="Failed to load factor snapshot." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Factor Snapshot</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {snapshot.symbol} · As of {snapshot.source_as_of_utc ?? "—"}
          </p>
        </div>
      </div>

      {/* Quality flags */}
      {snapshot.quality_flags?.length > 0 && (
        <QualityFlagList flags={snapshot.quality_flags} />
      )}

      {/* Factor families */}
      <div className="grid gap-6 lg:grid-cols-2">
        {families.map((fam) => (
          <Panel key={fam.family} ariaLabel={`${fam.family} Factors`}>
            <h2 className="section-subtitle mb-4">{fam.family}</h2>
            <div className="space-y-3">
              {fam.factors.map((f) => (
                <div key={f.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-3">
                  <span className="text-sm font-medium text-foreground">{f.label}</span>
                  <div className="flex items-center gap-2">
                    <MonoValue
                      value={f.formatted_value ?? (f.value != null ? String(f.value) : "—")}
                      className="text-sm font-bold"
                    />
                    {f.tone && (
                      <span className={`text-[10px] font-mono ${toneClass(f.tone)}`}>
                        {f.tone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      {/* Strategy Fit Scores */}
      {snapshot.strategy_fit_scores?.length > 0 && (
        <Panel ariaLabel="Strategy Fit Scores">
          <h2 className="section-subtitle mb-4">Strategy Fit Scores</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.strategy_fit_scores.map((s) => (
              <div key={s.strategy_name} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-3">
                <span className="text-sm text-foreground">{s.strategy_name.replace(/_/g, " ")}</span>
                <MonoValue value={s.total_score.toFixed(0)} className="text-sm font-bold" />
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default FactorSnapshotPage;

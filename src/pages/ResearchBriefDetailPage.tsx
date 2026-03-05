import { Panel } from "@/components/shared/Panel";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  api,
  type ResearchBriefRecord,
  type ResearchBriefSummaryRecord,
} from "@/lib/api";
import { Button } from "@/components/ui/button";

const ResearchBriefDetailPage = () => {
  const { notebookId, briefId } = useParams<{ notebookId: string; briefId: string }>();
  const navigate = useNavigate();

  const { data: brief, isLoading, error } = useQuery({
    queryKey: ["research-brief", briefId],
    queryFn: () => api.getResearchBrief(briefId!),
    enabled: !!briefId,
  });

  const { data: versions } = useQuery({
    queryKey: ["research-brief-versions", notebookId],
    queryFn: () => api.getResearchBriefVersions(notebookId!),
    enabled: !!notebookId,
  });

  const { data: notebook } = useQuery({
    queryKey: ["research-notebook", notebookId],
    queryFn: () => api.getResearchNotebook(notebookId!),
    enabled: !!notebookId,
  });

  if (isLoading) return <LoadingState message="Loading research brief…" />;
  if (error || !brief) return <ErrorState message="Failed to load research brief." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/research")}>
          ← Back
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Research Brief — {notebook?.symbol ?? "…"}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Notebook {notebookId?.slice(0, 8)} · v{brief.version}
          </p>
        </div>
        <FreshnessBadge timestamp={brief.created_at} />
      </div>

      {/* Version Selector */}
      {versions && versions.length > 1 && (
        <Panel ariaLabel="Version History">
          <h2 className="section-subtitle mb-2">Version History</h2>
          <div className="flex gap-2 flex-wrap">
            {versions.map((v: ResearchBriefSummaryRecord) => (
              <button
                key={v.id}
                onClick={() => navigate(`/research/notebooks/${notebookId}/briefs/${v.id}`)}
                className={`rounded-pill px-3 py-1 text-xs font-mono ${
                  v.id === briefId
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary/50 text-muted-foreground border border-border"
                }`}
              >
                v{v.version}
              </button>
            ))}
          </div>
        </Panel>
      )}

      {/* Thesis */}
      <Panel ariaLabel="Brief Content">
        <h2 className="section-subtitle mb-3">Thesis Summary</h2>
        <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
          {brief.thesis_summary}
        </div>
      </Panel>

      {/* Delta from Prior */}
      {brief.delta_summary && (
        <Panel ariaLabel="Changes from Prior Version">
          <h2 className="section-subtitle mb-2">Changes from Prior</h2>
          <p className="text-sm text-foreground/80 italic">{brief.delta_summary}</p>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contradictions */}
        {brief.contradiction_summary && (
          <Panel ariaLabel="Contradictions">
            <h2 className="section-subtitle mb-3 text-caution">Contradictions</h2>
            <p className="text-sm text-foreground/80">{brief.contradiction_summary}</p>
          </Panel>
        )}

        {/* Open Questions */}
        {brief.unresolved_questions.length > 0 && (
          <Panel ariaLabel="Open Questions">
            <h2 className="section-subtitle mb-3 text-primary">Open Questions</h2>
            <ul className="space-y-2">
              {brief.unresolved_questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {q}
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      {/* Citations */}
      {brief.citations.length > 0 && (
        <Panel ariaLabel="Citations">
          <h2 className="section-subtitle mb-3">Citations</h2>
          <div className="space-y-2">
            {brief.citations.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-2">
                <span className="text-xs text-foreground/80">{c.title}</span>
                {c.published_at_utc && <FreshnessBadge timestamp={c.published_at_utc} />}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Sources from notebook */}
      {notebook && notebook.sources && notebook.sources.length > 0 && (
        <Panel ariaLabel="Source References">
          <h2 className="section-subtitle mb-3">Sources</h2>
          <div className="space-y-2">
            {notebook.sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-pill bg-secondary border border-border px-2 py-0.5 text-[9px] font-mono text-muted-foreground uppercase">
                    {s.source_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm text-foreground">{s.title}</span>
                </div>
                <FreshnessBadge timestamp={s.created_at} />
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default ResearchBriefDetailPage;

import { Panel } from "@/components/shared/Panel";
import { StatusPill } from "@/components/shared/StatusPill";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type EventBriefRecord, type EventBriefSummaryRecord } from "@/lib/api";
import { Button } from "@/components/ui/button";

const EventBriefDetailPage = () => {
  const { itemId, briefId } = useParams<{ itemId: string; briefId: string }>();
  const navigate = useNavigate();

  const { data: brief, isLoading, error } = useQuery({
    queryKey: ["event-brief", briefId],
    queryFn: () => api.getEventBrief(briefId!),
    enabled: !!briefId,
  });

  const { data: versions } = useQuery({
    queryKey: ["event-brief-versions", itemId],
    queryFn: () => api.getEventBriefVersions(itemId!),
    enabled: !!itemId,
  });

  const { data: calendarItem } = useQuery({
    queryKey: ["event-calendar-item", itemId],
    queryFn: () => api.getEventCalendarItem(itemId!),
    enabled: !!itemId,
  });

  if (isLoading) return <LoadingState message="Loading event brief…" />;
  if (error || !brief) return <ErrorState message="Failed to load event brief." />;

  const emp = brief.expected_move_profile;
  const hist = brief.historical_analog_summary;
  const ivc = brief.iv_crush_profile;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>
          ← Back
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {calendarItem?.event_type ?? "Event"}{" "}
            {calendarItem?.symbol ? `— ${calendarItem.symbol}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Brief v{brief.version} · {briefId}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatusPill status={brief.build_status === "completed" ? "completed" : "failed"} />
        {calendarItem && (
          <span className="rounded-pill bg-secondary/50 border border-border px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            {calendarItem.scope_type}
          </span>
        )}
        {brief.confidence != null && (
          <MonoValue value={`${(brief.confidence * 100).toFixed(0)}% confidence`} className="text-xs text-muted-foreground" />
        )}
        <FreshnessBadge timestamp={brief.freshness_at_utc ?? brief.created_at} />
      </div>

      {/* Version Selector */}
      {versions && versions.length > 1 && (
        <Panel ariaLabel="Version History">
          <h2 className="section-subtitle mb-2">Version History</h2>
          <div className="flex gap-2 flex-wrap">
            {versions.map((v: EventBriefSummaryRecord) => (
              <button
                key={v.id}
                onClick={() => navigate(`/events/${itemId}/briefs/${v.id}`)}
                className={`rounded-pill px-3 py-1 text-xs font-mono ${
                  v.id === briefId
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary/50 text-muted-foreground border border-border"
                }`}
              >
                v{v.version} {v.is_current ? "(current)" : ""}
              </button>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expected Move */}
        <Panel ariaLabel="Expected Move">
          <h2 className="section-subtitle mb-3">Expected Move</h2>
          <div className="space-y-3">
            {emp.implied_move_pct != null && (
              <div className="flex justify-between">
                <span className="micro-label">Implied Move</span>
                <MonoValue value={`±${emp.implied_move_pct.toFixed(1)}%`} className="text-lg font-bold text-accent" />
              </div>
            )}
            {emp.implied_move_abs != null && (
              <div className="flex justify-between">
                <span className="micro-label">Implied $ Move</span>
                <MonoValue value={`$${emp.implied_move_abs.toFixed(2)}`} />
              </div>
            )}
            {emp.underlying_price != null && (
              <div className="flex justify-between">
                <span className="micro-label">Underlying</span>
                <MonoValue value={`$${emp.underlying_price.toFixed(2)}`} />
              </div>
            )}
            {emp.iv_basis != null && (
              <div className="flex justify-between">
                <span className="micro-label">IV Basis</span>
                <MonoValue value={`${(emp.iv_basis * 100).toFixed(1)}%`} />
              </div>
            )}
          </div>
        </Panel>

        {/* Historical Analog */}
        <Panel ariaLabel="Historical Moves">
          <h2 className="section-subtitle mb-3">Historical Analogs</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="micro-label">Sample Size</span>
              <MonoValue value={String(hist.sample_size)} />
            </div>
            {hist.avg_abs_move_pct != null && (
              <div className="flex justify-between">
                <span className="micro-label">Avg |Move|</span>
                <MonoValue value={`${hist.avg_abs_move_pct.toFixed(1)}%`} />
              </div>
            )}
            {hist.median_abs_move_pct != null && (
              <div className="flex justify-between">
                <span className="micro-label">Median |Move|</span>
                <MonoValue value={`${hist.median_abs_move_pct.toFixed(1)}%`} />
              </div>
            )}
            {hist.max_abs_move_pct != null && (
              <div className="flex justify-between">
                <span className="micro-label">Max |Move|</span>
                <MonoValue value={`${hist.max_abs_move_pct.toFixed(1)}%`} />
              </div>
            )}
          </div>
        </Panel>

        {/* IV Crush Profile */}
        <Panel ariaLabel="IV Crush Profile">
          <h2 className="section-subtitle mb-3">IV Crush Profile</h2>
          <div className="space-y-3">
            {ivc.front_iv != null && (
              <div className="flex justify-between">
                <span className="micro-label">Front IV</span>
                <MonoValue value={`${(ivc.front_iv * 100).toFixed(1)}%`} />
              </div>
            )}
            {ivc.next_iv != null && (
              <div className="flex justify-between">
                <span className="micro-label">Next IV</span>
                <MonoValue value={`${(ivc.next_iv * 100).toFixed(1)}%`} />
              </div>
            )}
            {ivc.front_to_next_gap != null && (
              <div className="flex justify-between">
                <span className="micro-label">Gap</span>
                <MonoValue value={`${(ivc.front_to_next_gap * 100).toFixed(1)}%`} />
              </div>
            )}
            {ivc.expected_gap_compression != null && (
              <div className="flex justify-between">
                <span className="micro-label">Expected Compression</span>
                <MonoValue value={`${(ivc.expected_gap_compression * 100).toFixed(0)}%`} />
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Risk Flags & Strategy Biases */}
      <div className="grid gap-6 lg:grid-cols-2">
        {brief.risk_flags.length > 0 && (
          <Panel ariaLabel="Risk Flags">
            <h2 className="section-subtitle mb-2 text-destructive">Risk Flags</h2>
            <ul className="space-y-1">
              {brief.risk_flags.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </Panel>
        )}
        {brief.strategy_biases.length > 0 && (
          <Panel ariaLabel="Strategy Biases">
            <h2 className="section-subtitle mb-2 text-primary">Strategy Biases</h2>
            <div className="flex flex-wrap gap-2">
              {brief.strategy_biases.map((b, i) => (
                <span
                  key={i}
                  className="rounded-pill px-3 py-1 text-xs font-mono bg-primary/10 text-primary border border-primary/20"
                >
                  {b.replace(/_/g, " ")}
                </span>
              ))}
            </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground/80">{c.title}</span>
                </div>
                {c.published_at_utc && <FreshnessBadge timestamp={c.published_at_utc} />}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default EventBriefDetailPage;

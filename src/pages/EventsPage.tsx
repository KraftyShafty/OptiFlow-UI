import { Panel } from "@/components/shared/Panel";
import { StatusPill } from "@/components/shared/StatusPill";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type EventCalendarItemRecord } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EventsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-calendar"],
    queryFn: () => api.getEventCalendar(),
  });

  const refreshBrief = useMutation({
    mutationFn: (itemId: string) => api.refreshEventBrief(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-calendar"] });
      toast.success("Event brief refresh started");
    },
    onError: () => toast.error("Failed to refresh event brief"),
  });

  if (isLoading) return <LoadingState message="Loading event calendar…" />;
  if (error) return <ErrorState message="Failed to load event calendar." />;

  const sorted = [...(events ?? [])].sort((a, b) => {
    const aDate = a.scheduled_at_utc ?? a.window_start_utc ?? a.created_at;
    const bDate = b.scheduled_at_utc ?? b.window_start_utc ?? b.created_at;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  const statusMap: Record<string, "active" | "completed" | "failed"> = {
    scheduled: "active",
    active: "active",
    completed: "completed",
    cancelled: "failed",
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Event Calendar</h1>

      {sorted.length === 0 ? (
        <EmptyState
          title="No events"
          description="Events will appear here when detected by market data providers."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((evt: EventCalendarItemRecord) => {
            const brief = evt.current_brief;
            const schedDate = evt.scheduled_at_utc ?? evt.window_start_utc;

            return (
              <Panel key={evt.id} ariaLabel={evt.event_type}>
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {evt.symbol ?? (evt.related_symbols.join(", ") || "Market")}
                  </span>
                  <StatusPill status={statusMap[evt.status] ?? "active"} />
                </div>
                <p className="text-sm text-foreground mb-2">
                  {evt.event_type.replace(/_/g, " ")}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {schedDate && <FreshnessBadge timestamp={schedDate} />}
                  <span className="rounded-full bg-secondary/50 border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {evt.scope_type}
                  </span>
                  {brief?.expected_move_profile?.implied_move_pct != null && (
                    <MonoValue
                      value={`±${(brief.expected_move_profile.implied_move_pct * 100).toFixed(1)}%`}
                      className="text-xs text-accent"
                    />
                  )}
                </div>
                {brief && brief.risk_flags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {brief.risk_flags.map((f) => (
                      <span
                        key={f}
                        className="rounded-full border border-caution/30 bg-caution/10 px-2 py-0.5 text-[10px] font-mono text-caution"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-1 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => refreshBrief.mutate(evt.id)}
                    disabled={refreshBrief.isPending}
                  >
                    Refresh Brief
                  </Button>
                  {brief && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => navigate(`/events/${evt.id}/briefs/${brief.id}`)}
                    >
                      View Brief
                    </Button>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;

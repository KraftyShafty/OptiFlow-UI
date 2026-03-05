import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { RegimeBadge } from "@/components/shared/RegimeBadge";
import { QualityFlagList } from "@/components/shared/QualityFlagList";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type WatchlistRecord } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WatchlistPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeWlId, setActiveWlId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWlName, setNewWlName] = useState("");
  const [addSymbol, setAddSymbol] = useState("");

  const {
    data: watchlists,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["watchlists"],
    queryFn: () => api.getWatchlists(),
  });

  const createWl = useMutation({
    mutationFn: (body: { name: string }) => api.createWatchlist(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast.success("Watchlist created");
      setDialogOpen(false);
      setNewWlName("");
    },
    onError: () => toast.error("Failed to create watchlist"),
  });

  const addItem = useMutation({
    mutationFn: ({ wlId, symbol }: { wlId: string; symbol: string }) =>
      api.addWatchlistItem(wlId, { symbol }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast.success("Symbol added");
      setAddSymbol("");
    },
    onError: () => toast.error("Failed to add symbol"),
  });

  const removeItem = useMutation({
    mutationFn: ({ wlId, symbol }: { wlId: string; symbol: string }) =>
      api.removeWatchlistItem(wlId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast.success("Symbol removed");
    },
    onError: () => toast.error("Failed to remove symbol"),
  });

  const refreshWl = useMutation({
    mutationFn: (wlId: string) => api.refreshWatchlist(wlId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast.success("Watchlist refreshed");
    },
    onError: () => toast.error("Failed to refresh watchlist"),
  });

  if (isLoading) return <LoadingState message="Loading watchlists…" />;
  if (error) return <ErrorState message="Failed to load watchlists." />;

  const wls = watchlists ?? [];
  const active =
    wls.find((w) => w.id === activeWlId) ?? wls.find((w) => w.is_default) ?? wls[0];
  const items = active?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Watchlists</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">+ New Watchlist</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Watchlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Name</Label>
                <Input value={newWlName} onChange={(e) => setNewWlName(e.target.value)} placeholder="e.g. High IV Watch" />
              </div>
              <Button
                onClick={() => { if (newWlName.trim()) createWl.mutate({ name: newWlName }); }}
                disabled={createWl.isPending || !newWlName.trim()}
                className="w-full rounded-full"
              >
                {createWl.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Watchlist tabs */}
      {wls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {wls.map((wl: WatchlistRecord) => (
            <button
              key={wl.id}
              onClick={() => setActiveWlId(wl.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-mono whitespace-nowrap transition-colors ${
                active?.id === wl.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-secondary/50 text-muted-foreground border border-border hover:bg-secondary"
              }`}
            >
              {wl.name} ({wl.items.length})
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="flex items-center gap-3">
          <Input
            value={addSymbol}
            onChange={(e) => setAddSymbol(e.target.value.toUpperCase())}
            placeholder="Add symbol…"
            className="max-w-[180px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && addSymbol.trim()) {
                addItem.mutate({ wlId: active.id, symbol: addSymbol });
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { if (addSymbol.trim()) addItem.mutate({ wlId: active.id, symbol: addSymbol }); }}
            disabled={addItem.isPending}
          >
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshWl.mutate(active.id)}
            disabled={refreshWl.isPending}
          >
            Refresh
          </Button>
          {active.last_refreshed_at && (
            <FreshnessBadge timestamp={active.last_refreshed_at} />
          )}
        </div>
      )}

      <Panel ariaLabel="Watchlist Items">
        {items.length === 0 ? (
          <EmptyState title="Empty watchlist" description="Add symbols above to start tracking." />
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const sp = item.signal_payload;
              const cc = item.chain_context;
              const trendRegime = item.regime_snapshot?.trend_regime;
              const volRegime = item.regime_snapshot?.volatility_regime;
              const eventRegime = item.regime_snapshot?.event_regime;

              return (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4 hover:bg-secondary/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/analyze?symbol=${item.symbol}`)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-lg font-bold text-foreground">{item.symbol}</span>
                    <MonoValue value={`$${cc?.underlying_price?.toFixed(2) ?? sp?.spot_price?.toFixed(2) ?? "—"}`} />
                    {item.rank_delta != null && item.rank_delta !== 0 && (
                      <MonoValue
                        value={`${item.rank_delta > 0 ? "▲" : "▼"} ${Math.abs(item.rank_delta)}`}
                        positive={item.rank_delta > 0}
                        negative={item.rank_delta < 0}
                        className="text-xs"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {trendRegime && <RegimeBadge label="T" value={trendRegime} />}
                    {volRegime && <RegimeBadge label="V" value={volRegime} />}
                    {eventRegime && <RegimeBadge label="E" value={eventRegime} />}
                    {sp?.rank_score != null && (
                      <MonoValue value={`R${sp.rank_score.toFixed(0)}`} className="text-xs text-muted-foreground" />
                    )}
                    <QualityFlagList flags={cc?.quality_flags ?? []} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (active) removeItem.mutate({ wlId: active.id, symbol: item.symbol });
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
};

export default WatchlistPage;

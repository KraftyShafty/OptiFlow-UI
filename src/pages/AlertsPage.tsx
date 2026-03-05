import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { StatusPill } from "@/components/shared/StatusPill";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AlertRuleRecord, type AlertRuleType } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ruleTypes: { value: AlertRuleType; label: string }[] = [
  { value: "price_above", label: "Price Above" },
  { value: "price_below", label: "Price Below" },
  { value: "atm_iv_above", label: "ATM IV Above" },
  { value: "atm_iv_below", label: "ATM IV Below" },
  { value: "iv_rank_above", label: "IV Rank Above" },
  { value: "iv_rank_below", label: "IV Rank Below" },
  { value: "volume_spike", label: "Volume Spike" },
  { value: "open_interest_spike", label: "OI Spike" },
  { value: "activity_signal", label: "Activity Signal" },
  { value: "expiry_warning", label: "Expiry Warning" },
  { value: "pin_risk", label: "Pin Risk" },
  { value: "portfolio_risk", label: "Portfolio Risk" },
  { value: "provider_drift", label: "Provider Drift" },
];

const AlertsPage = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleSymbol, setNewRuleSymbol] = useState("");
  const [newRuleType, setNewRuleType] = useState<AlertRuleType>("price_above");
  const [newRuleThreshold, setNewRuleThreshold] = useState("");

  const {
    data: rules,
    isLoading: rulesLoading,
    error: rulesError,
  } = useQuery({
    queryKey: ["alert-rules"],
    queryFn: () => api.getAlertRules(),
  });

  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ["alert-events"],
    queryFn: () => api.getAlertEvents(),
    refetchInterval: 15_000,
  });

  const createRule = useMutation({
    mutationFn: (body: Parameters<typeof api.createAlertRule>[0]) =>
      api.createAlertRule(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      toast.success("Alert rule created");
      setDialogOpen(false);
      setNewRuleName("");
      setNewRuleSymbol("");
      setNewRuleThreshold("");
    },
    onError: () => toast.error("Failed to create alert rule"),
  });

  const muteRule = useMutation({
    mutationFn: (ruleId: string) => api.muteAlertRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      toast.success("Alert rule muted for 24h");
    },
    onError: () => toast.error("Failed to mute rule"),
  });

  const ackEvent = useMutation({
    mutationFn: (eventId: string) => api.acknowledgeAlertEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-events"] });
      toast.success("Alert acknowledged");
    },
    onError: () => toast.error("Failed to acknowledge alert"),
  });

  if (rulesLoading || eventsLoading) return <LoadingState message="Loading alerts…" />;
  if (rulesError || eventsError) return <ErrorState message="Failed to load alert data." />;

  const sortedEvents = [...(events ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const severityColor: Record<string, string> = {
    info: "text-accent",
    warn: "text-caution",
    critical: "text-destructive",
  };

  function handleCreateRule() {
    if (!newRuleName.trim()) return;
    createRule.mutate({
      name: newRuleName,
      symbol: newRuleSymbol || undefined,
      rule_type: newRuleType,
      condition: { threshold: parseFloat(newRuleThreshold) || 0 },
      cooldown_seconds: 3600,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(rules ?? []).filter((r) => r.enabled).length} active rules ·{" "}
            {sortedEvents.filter((e) => e.state === "open").length} open events
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">+ New Alert Rule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Alert Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. SPY IV Rank Alert"
                />
              </div>
              <div>
                <Label>Symbol (optional)</Label>
                <Input
                  value={newRuleSymbol}
                  onChange={(e) => setNewRuleSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. SPY"
                />
              </div>
              <div>
                <Label>Rule Type</Label>
                <Select value={newRuleType} onValueChange={(v) => setNewRuleType(v as AlertRuleType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ruleTypes.map((rt) => (
                      <SelectItem key={rt.value} value={rt.value}>
                        {rt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Threshold</Label>
                <Input
                  type="number"
                  value={newRuleThreshold}
                  onChange={(e) => setNewRuleThreshold(e.target.value)}
                  placeholder="e.g. 30"
                />
              </div>
              <Button onClick={handleCreateRule} disabled={createRule.isPending} className="w-full rounded-full">
                {createRule.isPending ? "Creating…" : "Create Rule"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events ({sortedEvents.length})</TabsTrigger>
          <TabsTrigger value="rules">Rules ({(rules ?? []).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-3 mt-4">
          {sortedEvents.length === 0 ? (
            <EmptyState
              title="No alert events"
              description="Create alert rules to start receiving notifications."
            />
          ) : (
            sortedEvents.map((evt) => (
              <Panel key={evt.id} ariaLabel={evt.title}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <StatusPill
                      status={evt.state === "acknowledged" ? "completed" : "active"}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-foreground">{evt.symbol}</span>
                        <span
                          className={`rounded-full bg-secondary/50 border border-border px-2 py-0.5 text-[10px] font-mono ${severityColor[evt.severity] ?? "text-muted-foreground"}`}
                        >
                          {evt.severity}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1">{evt.title}</p>
                      <p className="text-sm text-foreground/70 mt-0.5">{evt.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FreshnessBadge timestamp={evt.created_at} />
                    {evt.state === "open" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => ackEvent.mutate(evt.id)}
                        disabled={ackEvent.isPending}
                        className="text-xs"
                      >
                        Ack
                      </Button>
                    )}
                  </div>
                </div>
              </Panel>
            ))
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-3 mt-4">
          {(rules ?? []).length === 0 ? (
            <EmptyState
              title="No alert rules"
              description="Create your first alert rule to monitor market conditions."
            />
          ) : (
            (rules ?? []).map((rule: AlertRuleRecord) => (
              <Panel key={rule.id} ariaLabel={rule.name}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{rule.name}</span>
                      {rule.symbol && (
                        <span className="font-mono text-xs text-muted-foreground">{rule.symbol}</span>
                      )}
                      <span className="rounded-full bg-secondary/50 border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {rule.rule_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <StatusPill status={rule.enabled ? "active" : "completed"} className="scale-75" />
                      <span>{rule.enabled ? "Enabled" : "Disabled"}</span>
                      {rule.muted_until && <span>· Muted until {new Date(rule.muted_until).toLocaleString()}</span>}
                      {rule.last_triggered_at && (
                        <span>· Last fired <FreshnessBadge timestamp={rule.last_triggered_at} /></span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MonoValue
                      value={JSON.stringify(rule.condition)}
                      className="text-[10px] text-muted-foreground max-w-[120px] truncate"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => muteRule.mutate(rule.id)}
                      disabled={muteRule.isPending}
                      className="text-xs"
                    >
                      Mute
                    </Button>
                  </div>
                </div>
              </Panel>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage;

import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type RiskProfile,
  type LLMPolicy,
  type StrategyName,
} from "@/lib/api";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const allStrategies: { value: StrategyName; label: string }[] = [
  { value: "long_call", label: "Long Call" },
  { value: "long_put", label: "Long Put" },
  { value: "covered_call", label: "Covered Call" },
  { value: "cash_secured_put", label: "Cash-Secured Put" },
  { value: "bull_call_debit_spread", label: "Bull Call Spread" },
  { value: "bear_put_debit_spread", label: "Bear Put Spread" },
  { value: "put_credit_spread", label: "Put Credit Spread" },
  { value: "call_credit_spread", label: "Call Credit Spread" },
  { value: "iron_condor", label: "Iron Condor" },
  { value: "long_straddle", label: "Long Straddle" },
];

const SettingsPage = () => {
  const queryClient = useQueryClient();

  /* ── Risk Profile ─────────────────────────────────── */
  const {
    data: riskProfile,
    isLoading: rpLoading,
    error: rpError,
  } = useQuery({
    queryKey: ["risk-profile"],
    queryFn: () => api.getRiskProfile(),
  });

  const [rp, setRp] = useState<RiskProfile | null>(null);
  useEffect(() => {
    if (riskProfile) setRp({ ...riskProfile });
  }, [riskProfile]);

  const saveRp = useMutation({
    mutationFn: (body: RiskProfile) => api.saveRiskProfile(body),
    onSuccess: (d) => {
      queryClient.setQueryData(["risk-profile"], d);
      toast.success("Risk profile saved");
    },
    onError: () => toast.error("Failed to save risk profile"),
  });

  /* ── LLM Policy ───────────────────────────────────── */
  const {
    data: llmPolicy,
    isLoading: lpLoading,
    error: lpError,
  } = useQuery({
    queryKey: ["llm-policy"],
    queryFn: () => api.getLLMPolicy(),
  });

  const [lp, setLp] = useState<LLMPolicy | null>(null);
  useEffect(() => {
    if (llmPolicy) setLp({ ...llmPolicy });
  }, [llmPolicy]);

  const saveLp = useMutation({
    mutationFn: (body: LLMPolicy) => api.saveLLMPolicy(body),
    onSuccess: (d) => {
      queryClient.setQueryData(["llm-policy"], d);
      toast.success("LLM policy saved");
    },
    onError: () => toast.error("Failed to save LLM policy"),
  });

  /* ── LLM Costs ────────────────────────────────────── */
  const { data: costReport } = useQuery({
    queryKey: ["llm-costs", 7],
    queryFn: () => api.getLLMCosts(7),
  });

  /* ── Provider Health (runtime diagnostics) ────────── */
  const { data: healthData } = useQuery({
    queryKey: ["provider-health"],
    queryFn: () => api.getProviderHealth(),
    refetchInterval: 30_000,
  });

  if (rpLoading || lpLoading) return <LoadingState message="Loading settings…" />;
  if (rpError || lpError) return <ErrorState message="Failed to load settings." />;
  if (!rp || !lp) return <LoadingState message="Initializing…" />;

  const providers = healthData?.providers ?? [];

  /* ── Cost chart data ──────────────────────────────── */
  const costChartData = (costReport?.daily ?? []).map((d) => ({
    date: d.date,
    cost: d.estimated_cost_usd,
    runs: d.run_count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>

      <Tabs defaultValue="risk">
        <TabsList>
          <TabsTrigger value="risk">Risk Profile</TabsTrigger>
          <TabsTrigger value="llm">LLM Policy</TabsTrigger>
          <TabsTrigger value="costs">LLM Costs</TabsTrigger>
          <TabsTrigger value="runtime">Runtime</TabsTrigger>
        </TabsList>

        {/* ── Risk Profile Tab ─────────────────────────── */}
        <TabsContent value="risk" className="mt-4">
          <Panel ariaLabel="Risk Profile">
            <SectionHeader title="Risk Profile" />
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div>
                <Label>Account Size ($)</Label>
                <Input
                  type="number"
                  value={rp.account_size}
                  onChange={(e) => setRp({ ...rp, account_size: +e.target.value })}
                />
              </div>
              <div>
                <Label>Max Risk Per Trade (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={rp.max_risk_per_trade_pct}
                  onChange={(e) => setRp({ ...rp, max_risk_per_trade_pct: +e.target.value })}
                />
              </div>
              <div>
                <Label>Max Total Short Premium (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={rp.max_total_short_premium_pct}
                  onChange={(e) => setRp({ ...rp, max_total_short_premium_pct: +e.target.value })}
                />
              </div>
              <div>
                <Label>Max Open Positions</Label>
                <Input
                  type="number"
                  value={rp.max_open_positions}
                  onChange={(e) => setRp({ ...rp, max_open_positions: +e.target.value })}
                />
              </div>
              <div>
                <Label>Min Open Interest</Label>
                <Input
                  type="number"
                  value={rp.min_open_interest}
                  onChange={(e) => setRp({ ...rp, min_open_interest: +e.target.value })}
                />
              </div>
              <div>
                <Label>Min Volume</Label>
                <Input
                  type="number"
                  value={rp.min_volume}
                  onChange={(e) => setRp({ ...rp, min_volume: +e.target.value })}
                />
              </div>
              <div>
                <Label>Max Bid-Ask Spread (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={rp.max_bid_ask_spread_pct}
                  onChange={(e) => setRp({ ...rp, max_bid_ask_spread_pct: +e.target.value })}
                />
              </div>
              <div>
                <Label>Max DTE</Label>
                <Input
                  type="number"
                  value={rp.max_dte}
                  onChange={(e) => setRp({ ...rp, max_dte: +e.target.value })}
                />
              </div>
              <div>
                <Label>Min DTE</Label>
                <Input
                  type="number"
                  value={rp.min_dte}
                  onChange={(e) => setRp({ ...rp, min_dte: +e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch
                  checked={rp.allow_american_option_approximations}
                  onCheckedChange={(v) => setRp({ ...rp, allow_american_option_approximations: v })}
                />
                <span className="text-sm text-foreground">Allow American option approximations</span>
              </div>
            </div>

            <div className="mt-4">
              <Label>Allowed Strategies</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {allStrategies.map((s) => (
                  <label key={s.value} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rp.allowed_strategies.includes(s.value)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...rp.allowed_strategies, s.value]
                          : rp.allowed_strategies.filter((v) => v !== s.value);
                        setRp({ ...rp, allowed_strategies: next });
                      }}
                      className="rounded border-border"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            <Button
              className="mt-6 rounded-full"
              onClick={() => saveRp.mutate(rp)}
              disabled={saveRp.isPending}
            >
              {saveRp.isPending ? "Saving…" : "Save Risk Profile"}
            </Button>
          </Panel>
        </TabsContent>

        {/* ── LLM Policy Tab ───────────────────────────── */}
        <TabsContent value="llm" className="mt-4">
          <Panel ariaLabel="LLM Policy">
            <SectionHeader title="LLM Policy" />
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div>
                <Label>Provider Priority (comma-separated)</Label>
                <Input
                  value={lp.llm_provider_priority.join(", ")}
                  onChange={(e) =>
                    setLp({
                      ...lp,
                      llm_provider_priority: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. ollama, openai"
                />
              </div>
              <div>
                <Label>Max Cost / Run (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={lp.max_cost_usd_per_run}
                  onChange={(e) => setLp({ ...lp, max_cost_usd_per_run: +e.target.value })}
                />
              </div>
              <div>
                <Label>Max LLM Calls / Run</Label>
                <Input
                  type="number"
                  value={lp.max_llm_calls_per_run}
                  onChange={(e) => setLp({ ...lp, max_llm_calls_per_run: +e.target.value })}
                />
              </div>
              <div>
                <Label>Max Prompt Tokens / Run</Label>
                <Input
                  type="number"
                  value={lp.max_prompt_tokens_per_run}
                  onChange={(e) => setLp({ ...lp, max_prompt_tokens_per_run: +e.target.value })}
                />
              </div>
              <div>
                <Label>Max Completion Tokens / Run</Label>
                <Input
                  type="number"
                  value={lp.max_completion_tokens_per_run}
                  onChange={(e) => setLp({ ...lp, max_completion_tokens_per_run: +e.target.value })}
                />
              </div>
              <div>
                <Label>Analyst Max Output Tokens</Label>
                <Input
                  type="number"
                  value={lp.analyst_max_output_tokens}
                  onChange={(e) => setLp({ ...lp, analyst_max_output_tokens: +e.target.value })}
                />
              </div>
              <div>
                <Label>Synthesizer Max Output Tokens</Label>
                <Input
                  type="number"
                  value={lp.synthesizer_max_output_tokens}
                  onChange={(e) => setLp({ ...lp, synthesizer_max_output_tokens: +e.target.value })}
                />
              </div>
              <div>
                <Label>Node Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={lp.node_timeout_seconds}
                  onChange={(e) => setLp({ ...lp, node_timeout_seconds: +e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch
                  checked={lp.allow_approved_rl_signals_in_analysis}
                  onCheckedChange={(v) =>
                    setLp({ ...lp, allow_approved_rl_signals_in_analysis: v })
                  }
                />
                <span className="text-sm text-foreground">
                  Allow approved RL signals in analysis
                </span>
              </div>
            </div>

            <Button
              className="mt-6 rounded-full"
              onClick={() => saveLp.mutate(lp)}
              disabled={saveLp.isPending}
            >
              {saveLp.isPending ? "Saving…" : "Save LLM Policy"}
            </Button>
          </Panel>
        </TabsContent>

        {/* ── LLM Costs Tab ────────────────────────────── */}
        <TabsContent value="costs" className="mt-4 space-y-6">
          <Panel ariaLabel="LLM Spend Telemetry">
            <div className="flex items-center justify-between mb-3">
              <SectionHeader title="LLM Spend (7-Day)" />
              <MonoValue
                value={`Total: $${(costReport?.total_estimated_cost_usd ?? 0).toFixed(2)}`}
                className="text-sm"
              />
            </div>
            {costChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={costChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 18%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(215 15% 50%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(215 15% 50%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(214 40% 9%)",
                      border: "1px solid hsl(214 20% 18%)",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="cost" fill="hsl(25 95% 53%)" radius={[4, 4, 0, 0]} name="Cost (USD)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No cost data available for the past 7 days.
              </p>
            )}
          </Panel>

          {(costReport?.providers ?? []).length > 0 && (
            <Panel ariaLabel="Provider Cost Breakdown">
              <SectionHeader title="Provider Breakdown" />
              <div className="space-y-2 mt-4">
                {costReport!.providers.map((p) => (
                  <div
                    key={p.provider}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3"
                  >
                    <span className="font-mono text-sm text-foreground">{p.provider}</span>
                    <div className="flex items-center gap-4">
                      <MonoValue value={`$${p.estimated_cost_usd.toFixed(2)}`} className="text-sm" />
                      <span className="font-mono text-xs text-muted-foreground">{p.run_count} runs</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span>Total runs: <strong className="text-foreground">{costReport!.total_runs}</strong></span>
                <span>Fallback rate: <strong className="text-foreground">{(costReport!.fallback_rate * 100).toFixed(1)}%</strong></span>
              </div>
            </Panel>
          )}
        </TabsContent>

        {/* ── Runtime Diagnostics Tab ──────────────────── */}
        <TabsContent value="runtime" className="mt-4">
          <Panel ariaLabel="Runtime Diagnostics">
            <SectionHeader title="Provider Health" />
            <div className="space-y-2 mt-4">
              {providers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No provider health data available.
                </p>
              ) : (
                providers.map((d) => (
                  <div
                    key={d.provider}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIndicator
                        status={d.healthy ? "healthy" : "error"}
                        label={d.provider}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      {!d.enabled && (
                        <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border">
                          disabled
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-muted-foreground max-w-[200px] truncate">
                        {d.detail}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;

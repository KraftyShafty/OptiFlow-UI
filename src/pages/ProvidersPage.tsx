import { Panel } from "@/components/shared/Panel";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useQuery } from "@tanstack/react-query";
import {
  api,
  type ProviderHealthRecord,
  type DriftBreach,
  type BackgroundJob,
} from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

function statusFromRecord(
  r: ProviderHealthRecord,
): "healthy" | "degraded" | "error" | "offline" {
  if (!r.enabled) return "offline";
  if (!r.configured) return "error";
  return r.healthy ? "healthy" : "degraded";
}

const capabilityMatrix = [
  { capability: "chain", yahoo: true, openbb: true, polygon: true, claude: false, gpt4: false },
  { capability: "quote", yahoo: true, openbb: false, polygon: true, claude: false, gpt4: false },
  { capability: "fundamentals", yahoo: true, openbb: false, polygon: false, claude: false, gpt4: false },
  { capability: "term_structure", yahoo: false, openbb: true, polygon: false, claude: false, gpt4: false },
  { capability: "vol_surface", yahoo: false, openbb: true, polygon: false, claude: false, gpt4: false },
  { capability: "activity", yahoo: false, openbb: false, polygon: true, claude: false, gpt4: false },
  { capability: "news", yahoo: false, openbb: false, polygon: true, claude: false, gpt4: false },
  { capability: "analysis", yahoo: false, openbb: false, polygon: false, claude: true, gpt4: true },
  { capability: "synthesis", yahoo: false, openbb: false, polygon: false, claude: true, gpt4: true },
];

const providerKeys = ["yahoo", "openbb", "polygon", "claude", "gpt4"] as const;
const providerLabels = ["Yahoo", "OpenBB", "Polygon", "Claude", "GPT-4"];

const ProvidersPage = () => {
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
  } = useQuery({
    queryKey: ["provider-health"],
    queryFn: () => api.getProviderHealth(),
    refetchInterval: 30_000,
  });

  const { data: driftData } = useQuery({
    queryKey: ["provider-drift"],
    queryFn: () => api.getProviderDrift(),
    refetchInterval: 30_000,
  });

  const { data: jobsData } = useQuery({
    queryKey: ["background-jobs"],
    queryFn: () => api.getBackgroundJobs(),
    refetchInterval: 15_000,
  });

  if (healthLoading) return <LoadingState message="Loading provider health…" />;
  if (healthError || !healthData) return <ErrorState message="Failed to load provider health." />;

  const providers = healthData.providers;
  const healthyCount = providers.filter((p) => p.healthy && p.enabled).length;

  const breaches: DriftBreach[] = driftData?.breaches ?? [];
  const driftTrend = driftData?.trend ?? [];
  const jobs: BackgroundJob[] = jobsData?.jobs ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Provider Diagnostics</h1>
      <p className="text-sm text-muted-foreground">
        {healthyCount}/{providers.length} providers healthy · Auto-refreshes every 30s
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => {
          const status = statusFromRecord(p);
          return (
            <Panel key={p.provider} ariaLabel={p.provider}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-medium text-foreground">{p.provider}</span>
                <StatusIndicator status={status} label={status} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="micro-label">Latency</span>
                  <MonoValue value={p.latency_ms != null ? `${p.latency_ms}ms` : "—"} className="text-xs" />
                </div>
                <div className="flex justify-between">
                  <span className="micro-label">Last Check</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(p.checked_at_utc), { addSuffix: true })}
                  </span>
                </div>
                <div>
                  <span className="micro-label">Capabilities</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.capabilities.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-secondary/50 border border-border px-2 py-0.5 text-[9px] font-mono text-muted-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Capability Matrix */}
      <Panel ariaLabel="Capability Matrix">
        <h2 className="section-subtitle mb-3">Capability Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="micro-label pb-2">Capability</th>
                {providerLabels.map((l) => (
                  <th key={l} className="micro-label pb-2 text-center">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capabilityMatrix.map((row) => (
                <tr key={row.capability} className="border-b border-border/30">
                  <td className="py-2 font-mono text-xs text-foreground">{row.capability}</td>
                  {providerKeys.map((k) => (
                    <td key={k} className="py-2 text-center">
                      {row[k] ? (
                        <span className="text-success">●</span>
                      ) : (
                        <span className="text-muted-foreground/30">○</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Provider Drift */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel ariaLabel="Drift Trend">
          <h2 className="section-subtitle mb-3">Drift Trending</h2>
          {driftTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={driftTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="ts" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="yahoo" stroke="var(--primary)" strokeWidth={2} dot={false} name="Yahoo" />
                <Line type="monotone" dataKey="openbb" stroke="var(--success)" strokeWidth={2} dot={false} name="OpenBB" />
                <Line type="monotone" dataKey="polygon" stroke="var(--destructive)" strokeWidth={2} dot={false} name="Polygon" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No drift trend data available</p>
          )}
        </Panel>

        <Panel ariaLabel="Drift Breaches">
          <h2 className="section-subtitle mb-3">Drift Breaches</h2>
          {breaches.length > 0 ? (
            <div className="space-y-2">
              {breaches.map((d, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    d.breach
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border/50 bg-secondary/20"
                  }`}
                >
                  <div>
                    <span className="font-mono text-sm text-foreground">{d.provider}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{d.field}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MonoValue value={`${d.expected}`} className="text-xs text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">→</span>
                    <MonoValue value={`${d.actual}`} className="text-xs" />
                    <MonoValue
                      value={`${d.drift_pct.toFixed(1)}%`}
                      negative={d.breach}
                      className="text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No drift breaches detected</p>
          )}
        </Panel>
      </div>

      {/* Background Jobs */}
      <Panel ariaLabel="Background Jobs">
        <h2 className="section-subtitle mb-3">Background Jobs</h2>
        {jobs.length > 0 ? (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div
                key={job.name}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3"
              >
                <span className="text-sm font-mono text-foreground">{job.name}</span>
                <div className="flex items-center gap-3">
                  <StatusIndicator status={job.status === "running" ? "healthy" : "degraded"} label={job.status} />
                  {job.last_run_at && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(job.last_run_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {["chain_refresh", "watchlist_capture", "factor_snapshot", "regime_snapshot", "archive_backfill"].map(
              (job) => (
                <div
                  key={job}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3"
                >
                  <span className="text-sm font-mono text-foreground">{job}</span>
                  <StatusIndicator status="healthy" label="idle" />
                </div>
              ),
            )}
          </div>
        )}
      </Panel>
    </div>
  );
};

export default ProvidersPage;

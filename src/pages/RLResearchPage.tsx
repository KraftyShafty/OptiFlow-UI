import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { StatusPill } from "@/components/shared/StatusPill";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type RLDatasetRecord,
  type RLTrainingRunRecord,
  type RLModelArtifactRecord,
  type RLSignalRecord,
} from "@/lib/api";
import { toast } from "sonner";

const RLResearchPage = () => {
  const queryClient = useQueryClient();
  const [newDsName, setNewDsName] = useState("");
  const [newDsSymbols, setNewDsSymbols] = useState("SPY");
  const [signalSymbol, setSignalSymbol] = useState("SPY");

  const { data: datasets, isLoading: dsLoading } = useQuery({
    queryKey: ["rl-datasets"],
    queryFn: () => api.listRLDatasets(),
  });

  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ["rl-training-runs"],
    queryFn: () => api.listRLTrainingRuns(),
  });

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ["rl-models"],
    queryFn: () => api.listRLModels(),
  });

  const { data: signals } = useQuery({
    queryKey: ["rl-signals", signalSymbol],
    queryFn: () => api.getRLSignals(signalSymbol),
    enabled: !!signalSymbol,
  });

  const createDataset = useMutation({
    mutationFn: () =>
      api.createRLDataset({
        name: newDsName,
        symbol_universe: newDsSymbols.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rl-datasets"] });
      toast.success("Dataset created");
      setNewDsName("");
    },
    onError: () => toast.error("Failed to create dataset"),
  });

  const startTraining = useMutation({
    mutationFn: (datasetId: string) => api.createRLTrainingRun({ dataset_id: datasetId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rl-training-runs"] });
      toast.success("Training run started");
    },
    onError: () => toast.error("Failed to start training"),
  });

  const approveModel = useMutation({
    mutationFn: (modelId: string) => api.approveRLModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rl-models"] });
      toast.success("Model approved");
    },
  });

  const archiveModel = useMutation({
    mutationFn: (modelId: string) => api.archiveRLModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rl-models"] });
      toast.success("Model archived");
    },
  });

  const loading = dsLoading || runsLoading || modelsLoading;
  if (loading) return <LoadingState message="Loading RL research…" />;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">RL Research</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Datasets */}
        <Panel ariaLabel="Datasets">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-subtitle">Datasets</h2>
          </div>

          {/* Create form */}
          <div className="mb-3 flex gap-2">
            <Input
              placeholder="Name"
              value={newDsName}
              onChange={(e) => setNewDsName(e.target.value)}
              className="flex-1 text-xs"
            />
            <Input
              placeholder="Symbols"
              value={newDsSymbols}
              onChange={(e) => setNewDsSymbols(e.target.value.toUpperCase())}
              className="w-24 text-xs"
            />
            <Button
              size="sm"
              onClick={() => createDataset.mutate()}
              disabled={!newDsName.trim() || createDataset.isPending}
            >
              +
            </Button>
          </div>

          <div className="space-y-2">
            {(datasets ?? []).length === 0 ? (
              <EmptyState title="No datasets" description="Create one above." />
            ) : (
              (datasets ?? []).map((ds: RLDatasetRecord) => (
                <div key={ds.id} className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{ds.name}</span>
                    <StatusIndicator
                      status={ds.status === "completed" ? "healthy" : ds.status === "failed" ? "degraded" : "checking"}
                      label={ds.status}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <MonoValue value={`${(ds.row_count / 1000).toFixed(0)}k rows`} className="text-[10px] text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-mono">{ds.symbol_universe.join(", ")}</span>
                    </div>
                    {ds.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-6"
                        onClick={() => startTraining.mutate(ds.id)}
                        disabled={startTraining.isPending}
                      >
                        Train
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* Training Runs */}
        <Panel ariaLabel="Training Runs">
          <h2 className="section-subtitle mb-3">Training Runs</h2>
          <div className="space-y-2">
            {(runs ?? []).length === 0 ? (
              <EmptyState title="No training runs" description="Create a dataset first." />
            ) : (
              (runs ?? []).map((tr: RLTrainingRunRecord) => (
                <div key={tr.id} className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground font-mono">{tr.dataset_id.slice(0, 8)}…</span>
                    <StatusPill
                      status={
                        tr.status === "completed"
                          ? "completed"
                          : tr.status === "failed"
                            ? "failed"
                            : "active"
                      }
                    />
                  </div>
                  <FreshnessBadge timestamp={tr.updated_at} />
                  {tr.validation_report && (
                    <div className="flex gap-3 mt-1">
                      <MonoValue
                        value={`SR: ${tr.validation_report.sharpe.toFixed(2)}`}
                        className="text-[10px] text-muted-foreground"
                      />
                      <MonoValue
                        value={`DD: ${(tr.validation_report.max_drawdown * 100).toFixed(1)}%`}
                        className="text-[10px] text-muted-foreground"
                      />
                      {tr.validation_report.approved_candidate && (
                        <span className="text-[10px] text-success font-mono">✓ candidate</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* Models */}
        <Panel ariaLabel="Model Artifacts">
          <h2 className="section-subtitle mb-3">Models</h2>
          <div className="space-y-2">
            {(models ?? []).length === 0 ? (
              <EmptyState title="No models" description="Complete a training run first." />
            ) : (
              (models ?? []).map((m: RLModelArtifactRecord) => (
                <div key={m.id} className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-medium text-foreground">{m.name}</span>
                    <StatusPill
                      status={
                        m.status === "approved"
                          ? "go"
                          : m.status === "draft"
                            ? "pending"
                            : "cancelled"
                      }
                    />
                  </div>
                  <FreshnessBadge timestamp={m.created_at} />
                  {m.status === "draft" && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-6 text-success border-success/30"
                        onClick={() => approveModel.mutate(m.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-6"
                        onClick={() => archiveModel.mutate(m.id)}
                      >
                        Archive
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Signal Audit */}
      <Panel ariaLabel="Signal Audit">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-subtitle">Live RL Signals</h2>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Symbol</Label>
            <Input
              value={signalSymbol}
              onChange={(e) => setSignalSymbol(e.target.value.toUpperCase())}
              className="w-24 text-xs font-mono"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Symbol", "Model", "Signal", "Confidence", "Detail", "Timestamp"].map((h) => (
                  <th key={h} className="micro-label pb-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(signals ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-sm text-muted-foreground">
                    No signals for {signalSymbol}.
                  </td>
                </tr>
              ) : (
                (signals ?? []).map((s: RLSignalRecord) => (
                  <tr key={s.id} className="border-b border-border/30">
                    <td className="py-2 font-mono font-medium text-foreground">{s.symbol}</td>
                    <td className="py-2 font-mono text-xs text-muted-foreground">{s.model_artifact_id.slice(0, 8)}…</td>
                    <td className="py-2">
                      <span
                        className={`rounded-pill px-2 py-0.5 text-[10px] font-mono ${
                          s.action_label === "bullish" || s.action_label === "buy"
                            ? "bg-success/10 text-success border border-success/20"
                            : s.action_label === "bearish" || s.action_label === "sell"
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-secondary/50 text-muted-foreground border border-border"
                        }`}
                      >
                        {s.action_label}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-xs">{(s.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">{s.detail}</td>
                    <td className="py-2 font-mono text-[10px] text-muted-foreground">
                      {new Date(s.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

export default RLResearchPage;

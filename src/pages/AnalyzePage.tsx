import { Panel } from "@/components/shared/Panel";
import { StatusPill } from "@/components/shared/StatusPill";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { QualityFlagList } from "@/components/shared/QualityFlagList";
import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  subscribeAnalysisEvents,
  type AnalysisRunResponse,
  type AnalysisRunDetail,
  type StrategyName,
} from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

interface StageEvent {
  stage: string;
  status: string;
  detail?: string;
}

const STAGE_ORDER = [
  "LoadContext",
  "MarketData",
  "Technical",
  "News",
  "Strategy",
  "Risk",
  "Synthesizer",
];

const stageLabel: Record<string, string> = {
  LoadContext: "Load Context",
  MarketData: "Market Data",
  Technical: "Technical Analysis",
  News: "News Sentiment",
  Strategy: "Strategy Evaluation",
  Risk: "Risk Assessment",
  Synthesizer: "Synthesizer",
};

const AnalyzePage = () => {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState("SPY");
  const [stages, setStages] = useState<StageEvent[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisRunDetail | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // Cleanup SSE on unmount
  useEffect(() => () => unsubRef.current?.(), []);

  const startRun = useMutation({
    mutationFn: (sym: string) => api.createAnalysisRun({ symbol: sym }),
    onSuccess: (resp: AnalysisRunResponse) => {
      setRunId(resp.run_id);
      setStages([]);
      setResult(null);
      setError(null);
      setRunning(true);

      // Subscribe to SSE
      unsubRef.current?.();
      unsubRef.current = subscribeAnalysisEvents(
        resp.run_id,
        (eventType, payload) => {
          if (eventType === "analysis.stage") {
            const p = payload as StageEvent;
            setStages((prev) => [...prev, p]);
          }
          if (eventType === "analysis.completed") {
            setRunning(false);
            // Fetch full results
            api.getAnalysisRun(resp.run_id).then((detail) => {
              setResult(detail);
              queryClient.invalidateQueries({ queryKey: ["analysis-runs"] });
            });
          }
          if (eventType === "analysis.failed") {
            setRunning(false);
            setError("Analysis failed. Check provider health.");
            toast.error("Analysis failed");
          }
        },
        () => {
          setRunning(false);
          setError("Lost connection to analysis stream.");
        },
      );
    },
    onError: () => {
      toast.error("Failed to start analysis");
      setRunning(false);
    },
  });

  const handleRun = useCallback(() => {
    if (!symbol.trim()) return;
    startRun.mutate(symbol.trim());
  }, [symbol, startRun]);

  const completedStages = stages
    .filter((s) => s.status === "completed" || s.status === "succeeded")
    .map((s) => s.stage);

  const currentStage = stages.find(
    (s) => s.status === "running" || s.status === "started",
  )?.stage;

  // Extract recommendation from result_payload
  const output = result?.result_payload as Record<string, unknown> | undefined;
  const recommendation = output?.recommendation_status as string | undefined;
  const bullCase = output?.bull_case as string | undefined;
  const bearCase = output?.bear_case as string | undefined;
  const candidateStrategies = (output?.candidate_strategies as StrategyName[]) ?? [];
  const confidenceBand = output?.confidence_band as string | undefined;
  const whyNotTradeNow = output?.why_not_trade_now as string | undefined;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        AI Analysis Workspace
      </h1>

      <Panel ariaLabel="Analysis Input">
        <div className="flex items-end gap-4">
          <div>
            <Label>Symbol</Label>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-32 font-mono"
            />
          </div>
          <Button
            onClick={handleRun}
            disabled={running || startRun.isPending}
            className="rounded-full flex items-center gap-2"
          >
            {running && <Loader2 className="h-4 w-4 animate-spin" />}
            {running ? "Analyzing…" : "Run Analysis"}
          </Button>
        </div>
      </Panel>

      {/* Stage Progress */}
      {(running || result || error) && (
        <Panel ariaLabel="Analysis Pipeline">
          <h2 className="section-subtitle mb-4">Analysis Pipeline</h2>
          <div className="space-y-2">
            {STAGE_ORDER.map((key) => {
              const completed = completedStages.includes(key);
              const isCurrent = currentStage === key;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: completed || isCurrent ? 1 : 0.4 }}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/20 px-4 py-2.5"
                >
                  {completed ? (
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                  )}
                  <span
                    className={`text-sm font-mono ${completed ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {stageLabel[key] ?? key}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </Panel>
      )}

      {error && <ErrorState message={error} />}

      {/* Results */}
      {result && output && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Recommendation */}
            <Panel ariaLabel="Recommendation">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="section-subtitle">Recommendation</h2>
                <StatusPill
                  status={
                    recommendation === "consider"
                      ? "go"
                      : recommendation === "watch"
                        ? "pending"
                        : "cancelled"
                  }
                />
                {confidenceBand && (
                  <MonoValue
                    value={confidenceBand}
                    className="text-xs text-muted-foreground"
                  />
                )}
              </div>
              {whyNotTradeNow && (
                <p className="text-sm text-caution mb-3 italic">
                  {whyNotTradeNow}
                </p>
              )}
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel ariaLabel="Bull Case">
                <h2 className="section-subtitle mb-2 text-success">Bull Case</h2>
                <p className="text-sm text-foreground/80">{bullCase}</p>
              </Panel>
              <Panel ariaLabel="Bear Case">
                <h2 className="section-subtitle mb-2 text-destructive">
                  Bear Case
                </h2>
                <p className="text-sm text-foreground/80">{bearCase}</p>
              </Panel>
            </div>

            {/* Candidate Strategies */}
            {candidateStrategies.length > 0 && (
              <Panel ariaLabel="Candidate Strategies">
                <h2 className="section-subtitle mb-3">Candidate Strategies</h2>
                <div className="flex flex-wrap gap-2">
                  {candidateStrategies.map((cs) => (
                    <span
                      key={cs}
                      className="rounded-pill px-3 py-1 text-xs font-mono bg-secondary/50 border border-border text-foreground"
                    >
                      {cs.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </Panel>
            )}

            {/* Quality Flags & LLM Usage */}
            {result.quality_flags.length > 0 && (
              <Panel ariaLabel="Quality Flags">
                <h2 className="section-subtitle mb-2">Quality Flags</h2>
                <QualityFlagList flags={result.quality_flags} />
              </Panel>
            )}

            {result.llm_usage && (
              <Panel ariaLabel="LLM Usage">
                <h2 className="section-subtitle mb-2">LLM Usage</h2>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>
                    Calls: <MonoValue value={String(result.llm_usage.calls)} className="text-xs" />
                  </span>
                  <span>
                    Cost:{" "}
                    <MonoValue
                      value={`$${result.llm_usage.estimated_cost_usd.toFixed(4)}`}
                      className="text-xs"
                    />
                  </span>
                  <span>
                    Providers: {result.llm_usage.providers_used.length}
                  </span>
                </div>
              </Panel>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AnalyzePage;

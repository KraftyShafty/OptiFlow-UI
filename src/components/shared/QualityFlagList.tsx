import { cn } from "@/lib/utils";
import type { QualityFlag } from "@/lib/api";

const flagSeverity: Record<string, "info" | "warn" | "error"> = {
  stale_data: "error", missing_greeks: "error", derived_greeks: "warn",
  derived_iv: "warn", wide_spread: "warn", low_volume: "warn",
  low_open_interest: "info", delayed_source: "warn", stale_reference_rate: "error",
  missing_dividend_yield_assumed_zero: "info", american_option_bs_approximation: "info",
  insufficient_surface_points: "warn", pin_risk: "warn", blocked_by_risk_profile: "error",
  single_side_atm_iv: "warn", capability_unavailable: "error", sparse_archive: "warn",
  heuristic_activity_signal: "info", heuristic_sentiment: "info", provider_drift: "warn",
};

const severityStyles = {
  info: "bg-muted/60 text-muted-foreground border-border",
  warn: "bg-caution/10 text-caution border-caution/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

interface QualityFlagListProps {
  flags: QualityFlag[];
  className?: string;
}

export function QualityFlagList({ flags, className }: QualityFlagListProps) {
  if (flags.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {flags.map((flag) => {
        const severity = flagSeverity[flag] || "info";
        return (
          <span
            key={flag}
            className={cn("inline-flex items-center rounded-pill border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider", severityStyles[severity])}
          >
            {flag.replace(/_/g, " ")}
          </span>
        );
      })}
    </div>
  );
}

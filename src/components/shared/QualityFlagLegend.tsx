import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { QualityFlag } from "@/lib/api";

const flagDescriptions: Record<QualityFlag, { label: string; severity: "low" | "medium" | "high"; description: string }> = {
  stale_data: { label: "Stale Data", severity: "high", description: "Market data is older than expected refresh interval" },
  missing_greeks: { label: "Missing Greeks", severity: "high", description: "Greeks could not be computed for this contract" },
  derived_greeks: { label: "Derived Greeks", severity: "medium", description: "Greeks were derived from model rather than market quotes" },
  derived_iv: { label: "Derived IV", severity: "medium", description: "Implied volatility was interpolated or derived" },
  wide_spread: { label: "Wide Spread", severity: "medium", description: "Bid-ask spread exceeds acceptable threshold" },
  low_volume: { label: "Low Volume", severity: "medium", description: "Trading volume is below minimum threshold" },
  low_open_interest: { label: "Low OI", severity: "medium", description: "Open interest is below minimum threshold" },
  delayed_source: { label: "Delayed Source", severity: "high", description: "Data source is providing delayed quotes" },
  stale_reference_rate: { label: "Stale Ref Rate", severity: "medium", description: "Underlying reference rate is stale" },
  missing_dividend_yield_assumed_zero: { label: "No Div Yield", severity: "low", description: "Dividend yield unavailable, assumed zero" },
  american_option_bs_approximation: { label: "BS Approx", severity: "low", description: "Using Black-Scholes approximation for American option" },
  insufficient_surface_points: { label: "Low Surface Pts", severity: "medium", description: "Insufficient data points for vol surface construction" },
  pin_risk: { label: "Pin Risk", severity: "high", description: "Option is near ATM close to expiration" },
  blocked_by_risk_profile: { label: "Risk Blocked", severity: "high", description: "Position blocked by risk profile constraints" },
  single_side_atm_iv: { label: "1-Side ATM IV", severity: "medium", description: "ATM IV computed from single side only" },
  capability_unavailable: { label: "Cap Unavail", severity: "high", description: "Required provider capability is unavailable" },
  sparse_archive: { label: "Sparse Archive", severity: "low", description: "Archive has gaps in historical data" },
  heuristic_activity_signal: { label: "Heuristic Activity", severity: "low", description: "Activity signal is based on heuristic detection" },
  heuristic_sentiment: { label: "Heuristic Sentiment", severity: "low", description: "Sentiment signal is heuristic, not model-based" },
  provider_drift: { label: "Provider Drift", severity: "high", description: "Data provider outputs are drifting from expected baseline" },
};

const severityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-caution/10 text-caution border-caution/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

interface QualityFlagLegendProps {
  trigger?: React.ReactNode;
}

export function QualityFlagLegend({ trigger }: QualityFlagLegendProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="rounded-pill border border-border bg-secondary/50 px-3 py-1 text-[10px] font-mono text-muted-foreground hover:bg-secondary">
            Flag Legend
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">Quality Flag Legend</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {(Object.entries(flagDescriptions) as [QualityFlag, typeof flagDescriptions[QualityFlag]][]).map(([flag, info]) => (
            <div key={flag} className="flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/20 p-3">
              <span className={`shrink-0 rounded-pill border px-2 py-0.5 text-[9px] font-mono ${severityColors[info.severity]}`}>
                {info.severity}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{info.label}</p>
                <p className="text-xs text-muted-foreground">{info.description}</p>
                <code className="text-[9px] font-mono text-muted-foreground/60">{flag}</code>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

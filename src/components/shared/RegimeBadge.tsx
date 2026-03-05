import { cn } from "@/lib/utils";
import type { TrendRegime, VolatilityRegime, LiquidityRegime, EventRegime } from "@/lib/api";

type RegimeValue = TrendRegime | VolatilityRegime | LiquidityRegime | EventRegime;

const regimeStyles: Record<string, string> = {
  bullish: "bg-success/15 text-success border-success/25",
  bearish: "bg-destructive/15 text-destructive border-destructive/25",
  rangebound: "bg-muted text-muted-foreground border-border",
  unstable: "bg-caution/15 text-caution border-caution/25",
  cheap_vol: "bg-success/15 text-success border-success/25",
  fair_vol: "bg-muted text-muted-foreground border-border",
  rich_vol: "bg-accent/15 text-accent border-accent/25",
  event_distorted: "bg-caution/15 text-caution border-caution/25",
  healthy: "bg-success/15 text-success border-success/25",
  tradable_with_caution: "bg-caution/15 text-caution border-caution/25",
  poor: "bg-destructive/15 text-destructive border-destructive/25",
  clean: "bg-muted text-muted-foreground border-border",
  approaching_event: "bg-caution/15 text-caution border-caution/25",
  active_event_window: "bg-accent/15 text-accent border-accent/25",
  post_event_vol_crush: "bg-primary/15 text-primary border-primary/25",
};

interface RegimeBadgeProps {
  label: string;
  value: RegimeValue;
  className?: string;
}

export function RegimeBadge({ label, value, className }: RegimeBadgeProps) {
  const style = regimeStyles[value] || "bg-muted text-muted-foreground border-border";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="micro-label">{label}</span>
      <span className={cn("inline-flex items-center rounded-pill border px-2 py-0.5 text-[10px] font-mono font-medium", style)}>
        {value.replace(/_/g, " ")}
      </span>
    </div>
  );
}

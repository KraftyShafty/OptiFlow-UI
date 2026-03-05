import { cn } from "@/lib/utils";

interface FreshnessBadgeProps {
  timestamp: string;
  className?: string;
}

export function FreshnessBadge({ timestamp, className }: FreshnessBadgeProps) {
  const now = Date.now();
  const ts = new Date(timestamp).getTime();
  const diffMs = now - ts;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  let label: string;
  let freshness: "fresh" | "stale" | "unknown";

  if (isNaN(ts)) {
    label = "Unknown";
    freshness = "unknown";
  } else if (diffMin < 5) {
    label = "Just now";
    freshness = "fresh";
  } else if (diffMin < 60) {
    label = `${diffMin}m ago`;
    freshness = diffMin < 15 ? "fresh" : "stale";
  } else if (diffHr < 24) {
    label = `${diffHr}h ago`;
    freshness = "stale";
  } else {
    label = `${Math.floor(diffHr / 24)}d ago`;
    freshness = "stale";
  }

  const freshnessStyles = {
    fresh: "text-success",
    stale: "text-caution",
    unknown: "text-muted-foreground",
  };

  return (
    <span className={cn("font-mono text-[10px]", freshnessStyles[freshness], className)}>
      {label}
    </span>
  );
}

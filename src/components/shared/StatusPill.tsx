import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  go: { label: "Go", className: "bg-success/20 text-success border-success/30" },
  caution: { label: "Caution", className: "bg-caution/20 text-caution border-caution/30" },
  no_trade: { label: "No Trade", className: "bg-destructive/20 text-destructive border-destructive/30" },
  pending: { label: "Pending", className: "bg-muted text-muted-foreground border-border" },
  error: { label: "Error", className: "bg-destructive/20 text-destructive border-destructive/30" },
  healthy: { label: "Healthy", className: "bg-success/20 text-success border-success/30" },
  degraded: { label: "Degraded", className: "bg-caution/20 text-caution border-caution/30" },
  down: { label: "Down", className: "bg-destructive/20 text-destructive border-destructive/30" },
  open: { label: "Open", className: "bg-primary/20 text-primary border-primary/30" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground border-border" },
  queued: { label: "Queued", className: "bg-muted text-muted-foreground border-border" },
  running: { label: "Running", className: "bg-primary/20 text-primary border-primary/30" },
  completed: { label: "Completed", className: "bg-success/20 text-success border-success/30" },
  failed: { label: "Failed", className: "bg-destructive/20 text-destructive border-destructive/30" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
  scheduled: { label: "Scheduled", className: "bg-primary/20 text-primary border-primary/30" },
  active: { label: "Active", className: "bg-success/20 text-success border-success/30" },
};

interface StatusPillProps {
  status: string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={cn("inline-flex items-center rounded-pill border px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider", config.className, className)}>
      {config.label}
    </span>
  );
}

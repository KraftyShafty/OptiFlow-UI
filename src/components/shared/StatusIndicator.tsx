import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "healthy" | "degraded" | "down";
  label: string;
}

const dotColors = {
  healthy: "bg-success",
  degraded: "bg-caution",
  down: "bg-destructive",
};

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", dotColors[status])} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

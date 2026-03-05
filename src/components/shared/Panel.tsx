import { cn } from "@/lib/utils";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

export function Panel({ children, className, ariaLabel, onClick }: PanelProps) {
  return (
    <div
      className={cn("glass-surface rounded-card p-5", className)}
      role="region"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

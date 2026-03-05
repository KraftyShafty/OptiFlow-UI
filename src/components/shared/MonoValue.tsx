import { cn } from "@/lib/utils";

interface MonoValueProps {
  value: string | number;
  prefix?: string;
  suffix?: string;
  positive?: boolean;
  negative?: boolean;
  className?: string;
}

export function MonoValue({ value, prefix, suffix, positive, negative, className }: MonoValueProps) {
  return (
    <span
      className={cn(
        "font-mono text-sm tabular-nums",
        positive && "text-success",
        negative && "text-destructive",
        !positive && !negative && "text-foreground",
        className
      )}
    >
      {prefix}{value}{suffix}
    </span>
  );
}

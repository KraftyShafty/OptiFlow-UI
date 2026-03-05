import { Panel } from "./Panel";
import { MonoValue } from "./MonoValue";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColorClass?: string;
  positive?: boolean;
  negative?: boolean;
}

export function MetricCard({ label, value, icon: Icon, iconColorClass = "text-primary", positive, negative }: MetricCardProps) {
  return (
    <Panel className="flex items-center gap-3">
      {Icon && (
        <div className="rounded-lg bg-secondary p-2">
          <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
      )}
      <div>
        <p className="micro-label">{label}</p>
        <MonoValue value={value} positive={positive} negative={negative} className="text-lg font-semibold" />
      </div>
    </Panel>
  );
}

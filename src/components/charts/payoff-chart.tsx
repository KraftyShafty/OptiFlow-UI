import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

interface PayoffChartProps {
  data: Array<{ price: number; pnl: number; [key: string]: number }>;
  /** Additional series keys to render (e.g., date slice curves) */
  series?: Array<{ key: string; label: string; color: string }>;
  breakevens?: number[];
  className?: string;
  height?: number;
}

const CHART_TOOLTIP_STYLE = {
  background: "#0b1525",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#edf4ff",
};

export function PayoffChart({
  data,
  series,
  breakevens,
  className,
  height = 300,
}: PayoffChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="price"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickFormatter={(v: number) => `$${v}`}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v}`}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: "#64748b" }} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          {breakevens?.map((be) => (
            <ReferenceLine
              key={be}
              x={be}
              stroke="#fbbf24"
              strokeDasharray="4 4"
              label={{ value: `BE $${be}`, fill: "#fbbf24", fontSize: 10 }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="pnl"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            animationDuration={800}
            animationEasing="ease-out"
          />
          {series?.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name={s.label}
              animationDuration={800}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

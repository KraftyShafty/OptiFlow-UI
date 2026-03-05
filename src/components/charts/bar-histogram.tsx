import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface BarHistogramProps {
  data: Array<{ label: string; value: number; color?: string }>;
  className?: string;
  height?: number;
  barColor?: string;
  /** Show positive values in green, negative in red */
  colorBySign?: boolean;
}

export function BarHistogram({
  data,
  className,
  height = 250,
  barColor = "#a78bfa",
  colorBySign = false,
}: BarHistogramProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#0b1525",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#edf4ff",
            }}
            labelStyle={{ color: "#64748b" }}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.color
                    ? entry.color
                    : colorBySign
                      ? entry.value >= 0
                        ? "#94a3b8"
                        : "#f87171"
                      : barColor
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

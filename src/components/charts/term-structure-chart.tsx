import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface TermStructureChartProps {
  data: Array<{ dte: number; iv: number; label?: string }>;
  className?: string;
  height?: number;
}

export function TermStructureChart({
  data,
  className,
  height = 250,
}: TermStructureChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="dte"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            label={{ value: "DTE", fill: "#64748b", fontSize: 10, position: "insideBottom", offset: -4 }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            domain={["auto", "auto"]}
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
            formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "IV"]}
            labelFormatter={(label) => `${label} DTE`}
          />
          <Line
            type="monotone"
            dataKey="iv"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={{ fill: "#a78bfa", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#a78bfa", stroke: "#08101b", strokeWidth: 2 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

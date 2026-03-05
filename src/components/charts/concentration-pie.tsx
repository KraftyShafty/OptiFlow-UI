import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#a78bfa", "#60a5fa", "#94a3b8", "#fbbf24", "#f97316", "#f87171", "#38bdf8", "#cbd5e1"];

interface ConcentrationPieProps {
  data: Array<{ name: string; value: number }>;
  className?: string;
  height?: number;
}

export function ConcentrationPie({
  data,
  className,
  height = 280,
}: ConcentrationPieProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            stroke="rgba(8, 16, 27, 0.5)"
            strokeWidth={2}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#0b1525",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#edf4ff",
            }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, "Weight"]}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#64748b" }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

import dynamic from "next/dynamic";
import type { Config, Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export function PlotClient({
  data,
  layout,
  config,
  className,
}: {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
}) {
  return (
    <div className={className}>
      <Plot
        data={data}
        layout={{
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: { color: "#dbe4f0" },
          margin: { l: 40, r: 20, t: 20, b: 40 },
          autosize: true,
          ...layout,
        }}
        config={{
          displayModeBar: false,
          responsive: true,
          ...config,
        }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

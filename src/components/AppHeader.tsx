import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/symbol": "Chain Explorer",
  "/scanner": "Scanner",
  "/watchlist": "Watchlists",
  "/analyze": "AI Workspace",
  "/lab": "Strategy Lab",
  "/events": "Events",
  "/research": "Research",
  "/forecasts": "Forecasts",
  "/journal": "Journal",
  "/portfolio": "Portfolio",
  "/review": "Reviews",
  "/backtest": "Backtest",
  "/research/rl": "RL Research",
  "/providers": "Providers",
  "/alerts": "Alerts",
  "/settings": "Settings",
};

export function AppHeader() {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const routeKey = Object.keys(routeLabels)
    .sort((a, b) => b.length - a.length)
    .find((key) => location.pathname.startsWith(key)) || "/";
  const label = routeLabels[routeKey] || "OptiFlow";

  const etTime = time.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <span className="text-sm font-heading font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center rounded-pill border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider text-primary">
          Advisory · Paper Trading
        </span>
        <StatusIndicator status="healthy" label="Providers" />
        <span className="font-mono text-xs text-muted-foreground">{etTime} ET</span>
      </div>
    </header>
  );
}

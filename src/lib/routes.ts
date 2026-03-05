// ── Static route paths ──

export const ROUTES = {
  DASHBOARD: "/",
  SCANNER: "/scanner",
  WATCHLIST: "/watchlist",
  ANALYZE: "/analyze",
  LAB: "/lab",
  EVENTS: "/events",
  RESEARCH: "/research",
  RESEARCH_RL: "/research/rl",
  FORECASTS: "/forecasts",
  JOURNAL: "/journal",
  PORTFOLIO: "/portfolio",
  REVIEW: "/review",
  BACKTEST: "/backtest",
  PROVIDERS: "/providers",
  SETTINGS: "/settings",
  ALERTS: "/alerts",
} as const;

// ── Parameterised route builders ──

export function buildSymbolHref(ticker: string): string {
  return `/symbol/${encodeURIComponent(ticker)}`;
}

export function buildAnalyzeHref(symbol?: string | null): string {
  if (!symbol) return ROUTES.ANALYZE;
  return `${ROUTES.ANALYZE}?symbol=${encodeURIComponent(symbol)}`;
}

export function buildEventBriefHref(itemId: string, briefId: string): string {
  return `/events/${encodeURIComponent(itemId)}/briefs/${encodeURIComponent(briefId)}`;
}

export function buildResearchBriefHref(notebookId: string, briefId: string): string {
  return `/research/notebooks/${encodeURIComponent(notebookId)}/briefs/${encodeURIComponent(briefId)}`;
}

export function buildForecastSetHref(forecastSetId: string): string {
  return `/forecasts/${encodeURIComponent(forecastSetId)}`;
}

export function buildBacktestRunHref(runId: string): string {
  return `/backtest/runs/${encodeURIComponent(runId)}`;
}

export function buildFactorSnapshotHref(factorSnapshotId: string): string {
  return `/factors/${encodeURIComponent(factorSnapshotId)}`;
}

export function buildRegimeSnapshotHref(regimeSnapshotId: string): string {
  return `/regimes/${encodeURIComponent(regimeSnapshotId)}`;
}

export function buildReviewHref(paperTradeId: string | null): string {
  if (!paperTradeId) {
    return "/review";
  }
  return `/review/${encodeURIComponent(paperTradeId)}`;
}

/**
 * Normalise legacy `?paperTradeId=` query-param review URLs to the
 * canonical `/review/:paperTradeId` path form.
 *
 * This function exists solely for migration-era compatibility.
 * No new code should generate query-param review links — always use
 * `buildReviewHref()` which produces the canonical path.
 *
 * @see buildReviewHref
 */
export function normalizeReviewHref(href: string | null | undefined): string | null {
  if (!href) {
    return null;
  }
  if (!href.startsWith("/review")) {
    return href;
  }

  const [pathname, query = ""] = href.split("?", 2);
  if (pathname !== "/review") {
    return href;
  }

  const paperTradeId = new URLSearchParams(query).get("paperTradeId");
  return paperTradeId ? buildReviewHref(paperTradeId) : href;
}

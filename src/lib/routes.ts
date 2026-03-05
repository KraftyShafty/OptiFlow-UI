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

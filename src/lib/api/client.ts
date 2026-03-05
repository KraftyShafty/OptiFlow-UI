// API client: base URL, generic request helper, query builder.

import type { MarketDataSource } from "../types";

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function buildOptionSnapshotQuery(params: {
  forceRefresh?: boolean;
  snapshotId?: string;
  source?: MarketDataSource;
}) {
  const query = new URLSearchParams();
  if (params.forceRefresh != null) {
    query.set("force_refresh", String(params.forceRefresh));
  }
  if (params.snapshotId) {
    query.set("snapshot_id", params.snapshotId);
  }
  if (params.source) {
    query.set("source", params.source);
  }
  const suffix = query.toString();
  return suffix ? `?${suffix}` : "";
}

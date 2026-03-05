import { describe, expect, it } from "vitest";

import { buildReviewHref, normalizeReviewHref } from "@/lib/routes";

describe("buildReviewHref", () => {
  it("returns /review when paperTradeId is null", () => {
    expect(buildReviewHref(null)).toBe("/review");
  });

  it("returns /review when paperTradeId is empty string", () => {
    expect(buildReviewHref("")).toBe("/review");
  });

  it("returns canonical /review/{id} path for a plain ID", () => {
    expect(buildReviewHref("abc-123")).toBe("/review/abc-123");
  });

  it("encodes special characters in paperTradeId", () => {
    expect(buildReviewHref("id/with/slashes")).toBe(
      "/review/id%2Fwith%2Fslashes",
    );
  });

  it("encodes spaces in paperTradeId", () => {
    expect(buildReviewHref("id with spaces")).toBe("/review/id%20with%20spaces");
  });
});

describe("normalizeReviewHref", () => {
  it("returns null for null input", () => {
    expect(normalizeReviewHref(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(normalizeReviewHref(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizeReviewHref("")).toBeNull();
  });

  it("passes through non-review hrefs unchanged", () => {
    expect(normalizeReviewHref("/journal")).toBe("/journal");
    expect(normalizeReviewHref("/portfolio")).toBe("/portfolio");
    expect(normalizeReviewHref("/analyze?symbol=SPY")).toBe(
      "/analyze?symbol=SPY",
    );
  });

  it("passes through canonical review paths unchanged", () => {
    expect(normalizeReviewHref("/review/abc-123")).toBe("/review/abc-123");
  });

  it("converts legacy query-style review links to canonical paths", () => {
    expect(normalizeReviewHref("/review?paperTradeId=abc-123")).toBe(
      "/review/abc-123",
    );
  });

  it("converts query-style with encoded characters", () => {
    expect(
      normalizeReviewHref("/review?paperTradeId=id%2Fwith%2Fslash"),
    ).toBe("/review/id%2Fwith%2Fslash");
  });

  it("returns original href when /review has no paperTradeId query param", () => {
    expect(normalizeReviewHref("/review?other=value")).toBe(
      "/review?other=value",
    );
  });

  it("returns original href when /review has no query at all", () => {
    expect(normalizeReviewHref("/review")).toBe("/review");
  });

  it("passes through review sub-paths that are already canonical", () => {
    expect(normalizeReviewHref("/review/some-uuid-here")).toBe(
      "/review/some-uuid-here",
    );
  });
});

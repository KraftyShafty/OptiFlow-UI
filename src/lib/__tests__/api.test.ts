import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_BASE } from "@/lib/api/client";
import { subscribeAnalysisEvents } from "@/lib/api";

type Listener = (event: MessageEvent) => void;

class FakeEventSource {
  static latest: FakeEventSource | null = null;

  onerror: ((event: Event) => void) | null = null;
  closed = false;
  readonly url: string;
  private readonly listeners = new Map<string, Listener[]>();

  constructor(url: string | URL) {
    this.url = String(url);
    FakeEventSource.latest = this;
  }

  addEventListener(eventType: string, listener: Listener) {
    const current = this.listeners.get(eventType) ?? [];
    current.push(listener);
    this.listeners.set(eventType, current);
  }

  close() {
    this.closed = true;
  }

  emit(eventType: string, payload: unknown) {
    const listeners = this.listeners.get(eventType) ?? [];
    const event = { data: JSON.stringify(payload) } as MessageEvent;
    listeners.forEach((listener) => listener(event));
  }

  emitError() {
    this.onerror?.(new Event("error"));
  }
}

const OriginalEventSource = globalThis.EventSource;

describe("subscribeAnalysisEvents", () => {
  beforeEach(() => {
    FakeEventSource.latest = null;
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (OriginalEventSource) {
      vi.stubGlobal("EventSource", OriginalEventSource);
    }
  });

  it("closes the stream after a terminal analysis event", () => {
    const onEvent = vi.fn();
    const onError = vi.fn();

    subscribeAnalysisEvents("analysis-run-1", onEvent, onError);

    const source = FakeEventSource.latest;
    expect(source?.url).toBe(`${API_BASE}/analysis/runs/analysis-run-1/events`);

    source?.emit("analysis.stage", { stage: "LoadContext" });
    expect(onEvent).toHaveBeenCalledWith("analysis.stage", {
      stage: "LoadContext",
    });
    expect(source?.closed).toBe(false);

    source?.emit("analysis.completed", {
      output: { recommendation_status: "watch" },
    });
    expect(source?.closed).toBe(true);

    source?.emitError();
    expect(onError).not.toHaveBeenCalled();
  });

  it("closes the stream when the caller unsubscribes", () => {
    const unsubscribe = subscribeAnalysisEvents(
      "analysis-run-2",
      vi.fn(),
      vi.fn(),
    );

    const source = FakeEventSource.latest;
    expect(source?.closed).toBe(false);

    unsubscribe();
    expect(source?.closed).toBe(true);
  });
});

import { useEffect, useRef, useState } from "react";

import type { WebSocketEventEnvelope } from "@/lib/api";

function buildWebSocketUrl(topics: string[]) {
  const base = import.meta.env.VITE_API_BASE_URL ?? "/api";
  const wsBase = base.replace(/^http/, "ws").replace(/\/api$/, "");
  const query = new URLSearchParams({ topics: topics.join(",") });
  return `${wsBase}/ws/events?${query.toString()}`;
}

export function useWebSocketEvents(topics: string[]) {
  const [events, setEvents] = useState<WebSocketEventEnvelope[]>([]);
  const [connected, setConnected] = useState(false);
  const retryRef = useRef<number | null>(null);
  const topicKey = topics.join(",");

  useEffect(() => {
    let socket: WebSocket | null = null;
    let cancelled = false;

    function connect(delayMs = 0) {
      if (cancelled) {
        return;
      }
      retryRef.current = window.setTimeout(() => {
        socket = new WebSocket(buildWebSocketUrl(topicKey.split(",").filter(Boolean)));
        socket.onopen = () => setConnected(true);
        socket.onclose = () => {
          setConnected(false);
          if (!cancelled) {
            connect(2_000);
          }
        };
        socket.onerror = () => {
          socket?.close();
        };
        socket.onmessage = (event) => {
          const parsed = JSON.parse(event.data) as WebSocketEventEnvelope;
          if (parsed.event_type === "websocket.connected") {
            return;
          }
          setEvents((current) => [parsed, ...current].slice(0, 25));
        };
      }, delayMs);
    }

    connect();

    return () => {
      cancelled = true;
      setConnected(false);
      if (retryRef.current !== null) {
        window.clearTimeout(retryRef.current);
      }
      socket?.close();
    };
  }, [topicKey]);

  return { connected, events };
}

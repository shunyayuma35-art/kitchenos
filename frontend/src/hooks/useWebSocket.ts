import { useEffect, useRef, useState, useCallback } from "react";
import type { StationType, WSMessage } from "../types";

type MessageHandler = (msg: WSMessage) => void;

export function useWebSocket(station: StationType, onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // 環境変数 VITE_WS_URL が設定されていればそちらを使用
    // 例: wss://kitchen-ai.up.railway.app
    const backendWsBase = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_WS_URL;
    let wsUrl: string;
    if (backendWsBase) {
      wsUrl = `${backendWsBase}/ws/${station}`;
    } else {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const host = window.location.host;
      wsUrl = `${protocol}://${host}/ws/${station}`;
    }
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // Start ping every 25s to keep connection alive
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      if (event.data === "pong") return;
      try {
        const msg = JSON.parse(event.data) as WSMessage;
        onMessageRef.current(msg);
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (pingTimer.current) clearInterval(pingTimer.current);
      // Auto-reconnect after 3s
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [station]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pingTimer.current) clearInterval(pingTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected };
}

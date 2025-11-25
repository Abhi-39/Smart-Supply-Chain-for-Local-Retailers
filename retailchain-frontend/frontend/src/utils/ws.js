// src/utils/ws.js
// Simple reconnecting WebSocket helper that calls onEvent(parsedMessage)
export function connectWebSocket(onEvent, opts = {}) {
  const { url } = opts;
  const WS_URL = url || (import.meta.env.VITE_WS_URL || null);

  // pick from config if not provided (lazy import to avoid circular)
  let base;
  try {
    base = (import.meta.env.VITE_WS_URL && import.meta.env.VITE_WS_URL) || null;
  } catch (e) {
    base = null;
  }

  let connectTo = WS_URL || null;
  if (!connectTo) {
    // fallback to using config-derived url (requires config.js present)
    try {
      // dynamic import to keep static import minimal
      // eslint-disable-next-line no-undef
      // We assume src/config.js exists; bundler will inline this.
      // Using a require-like import isn't ideal in ESM, but import above is ok.
      // Simpler: construct using import.meta.env as above.
      connectTo = (import.meta.env.VITE_WS_URL) || null;
    } catch (e) {
      connectTo = null;
    }
  }

  // final fallback: read from config module
  if (!connectTo) {
    try {
      // eslint-disable-next-line import/no-cycle
      // import config directly
      // Note: bundlers will replace this correctly.
      // This keeps the util simple.
      // If your build complains, replace this with hard-coded ws://localhost:8080/ws
      // or set VITE_WS_URL env var.
      // For local dev this will resolve to ws://localhost:8080/ws
      // using the same rules as config.js
      // we intentionally keep it simple to avoid adding STOMP libs.
      // eslint-disable-next-line
      // import { WS_BASE } from "../config"; // can't use top-level import to allow Vite env fallback
      connectTo = (() => {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        return (apiBase.startsWith("https") ? apiBase.replace(/^https/, "wss") : apiBase.replace(/^http/, "ws")) + "/ws";
      })();
    } catch (e) {
      connectTo = "ws://localhost:8080/ws";
    }
  }

  let ws = null;
  let reconnectTimer = null;
  let stopped = false;

  const create = () => {
    if (stopped) return;
    ws = new WebSocket(connectTo);

    ws.addEventListener("open", () => {
      // console.log("WS open", connectTo);
    });

    ws.addEventListener("message", (ev) => {
      try {
        const raw = ev.data;
        // if server sends JSON string
        const parsed = JSON.parse(raw);
        onEvent?.(parsed);
      } catch (err) {
        console.error("WS parse error", err, ev.data);
      }
    });

    ws.addEventListener("close", () => {
      // try reconnect with backoff
      if (stopped) return;
      reconnectTimer = setTimeout(() => create(), 1500 + Math.random() * 2000);
    });

    ws.addEventListener("error", (e) => {
      // allow close handler to attempt reconnect
      // console.error("WS error", e);
      try { ws.close(); } catch (ignore) {}
    });
  };

  create();

  return {
    close: () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try { ws?.close(); } catch (e) {}
    },
    // send helper
    send: (obj) => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
      } catch (e) {
        console.warn("WS send failed", e);
      }
    },
  };
}

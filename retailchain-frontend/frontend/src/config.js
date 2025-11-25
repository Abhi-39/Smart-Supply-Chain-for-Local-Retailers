export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const API_PRODUCTS = `${API_BASE}/api/products`;

export const WS_BASE =
  import.meta.env.VITE_WS_URL ||
  API_BASE.replace(/^http/, "ws") + "/ws";   // for WebSocket if used

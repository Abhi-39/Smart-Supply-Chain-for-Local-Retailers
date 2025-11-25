import { useEffect, useState } from "react";

let id = 0;

export const toastApi = {
  // message can be string or { msg, actionLabel, action }
  push: (setter, message, ttl = 3500) => {
    const key = ++id;
    const payload = typeof message === "string" ? { msg: message } : message;
    setter((s) => [...s, { key, ...payload }]);
    if (ttl > 0) {
      setTimeout(() => setter((s) => s.filter((t) => t.key !== key)), ttl);
    }
    return key;
  },
  remove: (setter, key) => setter((s) => s.filter((t) => t.key !== key)),
};

export default function ToastContainer({ toasts, setToasts }) {
  // simple hover-to-pause could be added; keep minimal
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.key} role="status">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1 }}>{t.msg}</div>
            {t.actionLabel && (
              <button
                className="btn"
                onClick={() => {
                  try {
                    t.action?.();
                  } catch (err) {
                    console.error("Toast action error", err);
                  } finally {
                    // remove toast after action
                    toastApi.remove(setToasts, t.key);
                  }
                }}
              >
                {t.actionLabel}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

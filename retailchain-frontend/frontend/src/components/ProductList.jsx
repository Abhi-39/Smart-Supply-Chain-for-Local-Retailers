// src/components/ProductList.jsx
import { useState } from "react";
import { API_PRODUCTS } from "../config";

/* A small deterministic color palette for initials */
const COLORS = [
  "#6EE7B7", "#7DD3FC", "#FBCFE8", "#FDE68A",
  "#FCA5A5", "#C7B3FF", "#FFD6A5", "#9EE6C1"
];

function stringToColorSeed(s) {
  if (!s) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function Avatar({ name, imageUrl }) {
  if (imageUrl) {
    return (
      <div className="avatar">
        <img src={imageUrl} alt={name} />
      </div>
    );
  }
  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .slice(0,2)
    .join("")
    .toUpperCase();
  const color = COLORS[stringToColorSeed(name) % COLORS.length];
  return (
    <div className="avatar" style={{ background: color }}>
      {initials}
    </div>
  );
}

export default function ProductList({ products = [], onChange, onLocalRemove, onEdit }) {
  const [editingId, setEditingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    // optimistic UI
    const deleted = products.find(p => p.id === id);
    onLocalRemove?.(id);
    try {
      const res = await fetch(`${API_PRODUCTS}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onChange?.();
    } catch (err) {
      console.error(err);
      alert("Delete failed, refreshing list");
      onChange?.();
    }
  };

  return (
    <>
      <div className="panel-top">
        <h2>Products</h2>
      </div>

      <div className="table-wrap">
        <table className="products" role="table" aria-label="Products table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>

                <td>
                  <div className="cell-avatar">
                    <Avatar name={p.name} imageUrl={p.imageUrl} />
                    <div>
                      <div className="cell-title">{p.name}</div>
                      <div className="cell-sub">#{p.sku}</div>
                    </div>
                  </div>
                </td>

                <td className="kv">{p.sku}</td>
                <td>{p.category}</td>

                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn icon-btn"
                    onClick={() => onEdit?.(p)}
                  >
                    Edit
                  </button>
                  <button className="btn" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cards" aria-hidden>
        {products.map((p) => (
          <div className="card" key={p.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={p.name} imageUrl={p.imageUrl} />
              <div>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div className="kv">SKU: {p.sku} • {p.category}</div>
              </div>
            </div>

            <div>
              <button className="btn icon-btn" onClick={() => onEdit?.(p)}>Edit</button>
              <button className="btn" style={{ marginLeft: 8 }} onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// src/components/ProductForm.jsx
import { useEffect, useState } from "react";
import { API_PRODUCTS } from "../config";

export default function ProductForm({ product = null, onSaved = () => {} }) {
  const [name, setName] = useState(product?.name || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [category, setCategory] = useState(product?.category || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!product?.id;

  useEffect(() => {
    // when product prop changes (editing different product), update fields
    setName(product?.name || "");
    setSku(product?.sku || "");
    setCategory(product?.category || "");
    setErrors({});
  }, [product]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name required";
    if (!sku.trim()) e.sku = "SKU required";
    if (!category.trim()) e.category = "Category required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const url = isEdit ? `${API_PRODUCTS}/${product.id}` : API_PRODUCTS;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers:{ "Content-Type": "application/json" },
        body: JSON.stringify({ name, sku, category })
      });
      if (!res.ok) {
        const body = await res.json().catch(()=>({}));
        setErrors(body || { submit: "Failed" });
        return;
      }
      onSaved();
    } catch (err) {
      alert("Failed to save");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field">
          <label className="kv">Name</label>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} />
          {errors.name && <div style={{color:"salmon"}}>{errors.name}</div>}
        </div>
        <div className="field">
          <label className="kv">SKU</label>
          <input type="text" value={sku} onChange={e=>setSku(e.target.value)} />
          {errors.sku && <div style={{color:"salmon"}}>{errors.sku}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label className="kv">Category</label>
          <input type="text" value={category} onChange={e=>setCategory(e.target.value)} />
          {errors.category && <div style={{color:"salmon"}}>{errors.category}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : (isEdit ? "Update product" : "Create product")}
        </button>
        <button className="btn ghost" type="button" onClick={() => onSaved()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

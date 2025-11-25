import { useState } from "react";
import ProductForm from "./ProductForm";

export default function EditProductRow({ product, onCancel, onSaved }) {
  // We'll render a single table-row spanning columns with the edit form
  return (
    <tr>
      <td colSpan={5} style={{ padding: 8 }}>
        <div style={{ background: "#fafafa", padding: 12 }}>
          <h4>Edit product #{product.id}</h4>
          <ProductForm product={product} onSaved={onSaved} />
          <div style={{ marginTop: 8 }}>
            <button onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </td>
    </tr>
  );
}

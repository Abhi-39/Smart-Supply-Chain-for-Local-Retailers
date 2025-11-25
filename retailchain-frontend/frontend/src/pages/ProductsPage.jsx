// src/pages/ProductsPage.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import ProductList from "../components/ProductList";
import Modal from "../components/Modal";
import ProductForm from "../components/ProductForm";
import ToastContainer, { toastApi } from "../components/ToastContainer";
import { connectWebSocket } from "../utils/ws";
import DashboardCard from "../components/DashboardCard";
import ProductsChart from "../components/ProductsChart";
import { API_PRODUCTS } from "../config";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");            // search query
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // for editing in modal
  const [editingProduct, setEditingProduct] = useState(null);

  // buffer for undo (store last deleted product)
  const lastDeletedRef = useRef(null);

  const fetchProducts = () => {
    setLoading(true);
    fetch(API_PRODUCTS)
      .then((r) => {
        if (!r.ok) throw new Error("Failed fetching products");
        return r.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error("fetch products error", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();

    const client = connectWebSocket((event) => {
      try {
        const { type, product } = event || {};
        if (!type || !product) return;

        setProducts((prev) => {
          if (type === "CREATE") {
            if (prev.some((p) => p.id === product.id)) return prev;
            return [...prev, product];
          }
          if (type === "UPDATE") {
            return prev.map((p) => (p.id === product.id ? product : p));
          }
          if (type === "DELETE") {
            return prev.filter((p) => p.id !== product.id);
          }
          return prev;
        });
      } catch (err) {
        console.error("Error handling WS event:", err);
      }
    });

    return () => {
      client?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // KPI computations
  const totalProducts = products.length;
  const categories = useMemo(() => {
    const m = new Map();
    for (const p of products) {
      const cat = p.category || "Uncategorized";
      m.set(cat, (m.get(cat) || 0) + 1);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [products]);

  const lowStockCount = products.some(p => typeof p.stock === "number")
    ? products.filter(p => p.stock < 5).length
    : null;
  const chartData = categories;

  const filtered = products.filter((p) => {
    const s = q.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s)
    );
  });

  // local optimistic remove used by ProductList
  const handleLocalRemove = (id) => {
    const removed = products.find(p => p.id === id);
    lastDeletedRef.current = removed ? { product: removed, deletedAt: Date.now() } : null;
    setProducts((prev) => prev.filter((p) => p.id !== id));

    // Show undo toast: use action to restore
    toastApi.push(setToasts, {
      msg: "Product deleted",
      actionLabel: "Undo",
      action: async () => {
        const entry = lastDeletedRef.current?.product;
        if (!entry) {
          toastApi.push(setToasts, "Nothing to undo");
          return;
        }
        try {
          const toCreate = { ...entry };
          delete toCreate.id;
          const res = await fetch(API_PRODUCTS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(toCreate),
          });
          if (!res.ok) throw new Error("Restore failed");
          await res.json();
          fetchProducts();
          lastDeletedRef.current = null;
          toastApi.push(setToasts, "Product restored");
        } catch (err) {
          console.error("Undo restore error", err);
          toastApi.push(setToasts, "Undo failed");
        }
      }
    }, 6000);
  };

  // open modal for add or edit
  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };
  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="kpi-row" style={{ marginBottom: 18 }}>
        <DashboardCard title="Total products" value={totalProducts} sub="All products in catalog" />
        <DashboardCard title="Categories" value={categories.length} sub="Distinct product categories">
          <div className="kpi-chart">
            <ProductsChart data={chartData} />
          </div>
        </DashboardCard>
        <DashboardCard
          title="Low stock"
          value={lowStockCount === null ? "—" : lowStockCount}
          sub={lowStockCount === null ? "Stock not tracked" : "Items with stock < 5"}
        />
      </div>

      <div className="controls" style={{ marginBottom: 12 }}>
        <div className="search">
          <input
            placeholder="Search name, SKU or category"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div style={{ marginLeft: 12 }}>
          <button className="btn primary" onClick={openAddModal}>Add product</button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ProductList
          products={filtered}
          onChange={fetchProducts}
          onLocalRemove={handleLocalRemove}
          onEdit={openEditModal}
        />
      )}

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h3 style={{ marginTop: 0 }}>{editingProduct ? "Edit product" : "Add product"}</h3>
          <ProductForm
            product={editingProduct}
            onSaved={() => {
              fetchProducts();
              toastApi.push(setToasts, editingProduct ? "Product updated" : "Product added!");
              setModalOpen(false);
            }}
          />
        </Modal>
      )}

      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  );
}

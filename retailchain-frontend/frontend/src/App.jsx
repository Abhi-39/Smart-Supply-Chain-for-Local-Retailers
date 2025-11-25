import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import AddProductPage from "./pages/AddProductPage";
import useTheme from "./hooks/useTheme";

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <BrowserRouter>
      <div className="app-wrap">
        <header className="header">
          <div className="brand">
            <h1>RetailChain</h1>
            <div className="nav">
              <Link to="/">Products</Link>
              <Link to="/add">Add Product</Link>
            </div>
          </div>

          <div className="header-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            
            {/* THEME TOGGLE BUTTON */}
            <button className="theme-btn" onClick={toggle}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Demo account link */}
            <button 
              className="btn ghost" 
              onClick={(e) => e.preventDefault()}
            >
              Demo account
            </button>

            {/* Add product button */}
            <button
              className="btn primary"
              onClick={() => (window.location = "/add")}
            >
              Add product
            </button>
          </div>
        </header>

        <main>
          <div className="panel">
            <Routes>
              <Route path="/" element={<ProductsPage />} />
              <Route path="/add" element={<AddProductPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import MyOrdersPage from "./MyOrdersPage";

const API_BASE = "http://localhost:5000";
const CATEGORIES = ["All", "Electronics", "Accessories", "Computers", "Audio"];

function readStoredUser() {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function ProductsPage({ onBuyNow }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1>E-Commerce Website</h1>
          <p>Browse products (React) → API (Express) → DB (MongoDB).</p>
        </div>
      </section>

      <section className="categories">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={
              category === selectedCategory
                ? "category-button category-button--active"
                : "category-button"
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <section className="product-grid">
        {loading && <p className="no-products">Loading products...</p>}
        {error && !loading && <p className="no-products">Error: {error}</p>}

        {!loading &&
          !error &&
          filteredProducts.map((product) => (
            <article key={product._id} className="product-card">
              <div className="product-image placeholder">
                <span>{product.emoji || "🛒"}</span>
              </div>
              <h2 className="product-name">{product.name}</h2>
              <p className="product-category">{product.category}</p>
              <p className="product-desc">{product.description}</p>
              <p className="product-price">
                ${Number(product.price).toFixed(2)}
              </p>

              <button
                className="btn-secondary"
                onClick={() => onBuyNow(product._id)}
              >
                Buy Now
              </button>
            </article>
          ))}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="no-products">No products in this category yet.</p>
        )}
      </section>
    </>
  );
}

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(readStoredUser());
  const [toast, setToast] = useState(null); // string message
  const [ordersCount, setOrdersCount] = useState(0);

  // keep navbar in sync after login/register
  useEffect(() => {
    function syncAuth() {
      setUser(readStoredUser());
    }
    window.addEventListener("authchange", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("authchange", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // fetch orders count when user logs in/out
  useEffect(() => {
    async function loadOrdersCount() {
      if (!user) {
        setOrdersCount(0);
        return;
      }

      const token = getToken();
      if (!token) {
        setOrdersCount(0);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => []);
        if (!res.ok) {
          setOrdersCount(0);
          return;
        }

        setOrdersCount(Array.isArray(data) ? data.length : 0);
      } catch {
        setOrdersCount(0);
      }
    }

    loadOrdersCount();
  }, [user]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
    setOrdersCount(0);

    window.dispatchEvent(new Event("authchange"));
    navigate("/login");
  }

  async function handleBuyNow(productId) {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/orders/buy-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qty: 1 }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast(`❌ ${data?.message || "Failed to place order"}`);
        return;
      }

      // success
      showToast("✅ Order placed!");
      setOrdersCount((c) => c + 1);
    } catch {
      showToast("❌ Network error placing order");
    }
  }

  const roleEmoji = user?.role === "admin" ? "👑" : "";

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      <header className="navbar">
        <NavLink to="/" className="logo">
          MyShop
        </NavLink>

        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Products
          </NavLink>

          {!user ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  "nav-link nav-link-primary" + (isActive ? " active" : "")
                }
              >
                Sign up
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/my-orders"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                My Orders <span className="badge">{ordersCount}</span>
              </NavLink>

              <span className="nav-link" style={{ color: "#e5e7eb" }}>
                {roleEmoji} {user.name}
              </span>

              <button type="button" className="nav-link-button" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<ProductsPage onBuyNow={handleBuyNow} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-orders" element={<MyOrdersPage showToast={showToast} />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2025 MyShop · React + Express demo</p>
      </footer>
    </div>
  );
}
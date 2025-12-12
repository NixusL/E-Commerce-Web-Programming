import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import MyOrdersPage from "./MyOrdersPage";
import AddProductPage from "./AddProductPage";
import EditProductPage from "./EditProductPage";
import { FiPlus } from "react-icons/fi";
import { FiEdit2 } from "react-icons/fi";

const API_BASE = "http://localhost:5000";
const CATEGORIES = ["All", "Electronics", "Accessories", "Computers", "Audio"];

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

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

function ProductsPage({ onBuyNow, user }) {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const myId = user?.id; // backend stores { id: user._id }
  const isAdmin = user?.role === "admin";

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
          filteredProducts.map((product) => {
            const createdById =
              typeof product.createdBy === "string"
                ? product.createdBy
                : product.createdBy?._id;

            const isMine = createdById && myId && createdById === myId;

            const canEdit = isAdmin || isMine;

            return (
              <article
                key={product._id}
                className={
                  "product-card" + (isMine ? " product-card--mine" : "")
                }
                style={{ position: "relative" }}
              >
                {/* Pencil icon top-right (owner/admin only) */}
                {canEdit && (
                  <button
                    type="button"
                    className="icon-btn"
                    title="Edit product"
                    onClick={() => navigate(`/products/${product._id}/edit`)}
                  >
                    <span className="edit-icon-wrap">
                      <FiEdit2 className="edit-icon" />
                    </span>
                  </button>
                )}

                <div className="product-image placeholder">
                  <span>{product.emoji || "🛒"}</span>
                </div>

                <h2 className="product-name">{product.name}</h2>
                <p className="product-category">{product.category}</p>
                <p className="product-desc">{product.description}</p>

                <p className="product-price">{formatPrice(product.price)}</p>

                <p className="product-meta">
                  Listed by{" "}
                  <span className="product-meta-strong">
                    {typeof product.createdBy === "object" && product.createdBy?.name
                      ? product.createdBy.name
                      : "Unknown"}
                  </span>

                  {typeof product.createdBy === "object" && product.createdBy?.email && (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        className="product-email"
                        href={`mailto:${product.createdBy.email}`}
                        title={`Email ${product.createdBy.name || "seller"}`}
                      >
                        {product.createdBy.email}
                      </a>
                    </>
                  )}
                </p>

                {/* Stock pill */}
                <p className={"stock-pill " + (product.inStock ? "stock-pill--in" : "stock-pill--out")}>
                  {product.inStock ? "✅ In stock" : "⛔ Out of stock"}
                </p>

                <div className={"product-actions" + (!product.inStock ? " product-actions--row" : "")}>
                  <button
                    className={"btn-secondary " + (!product.inStock ? "btn-disabled" : "")}
                    disabled={!product.inStock}
                    onClick={() => onBuyNow(product._id)}
                    title={!product.inStock ? "Out of stock" : "Buy now"}
                  >
                    Buy Now
                  </button>

                  {!product.inStock && (
                    <button
                      className="btn-notify"
                      type="button"
                      onClick={() => {
                        alert("🔔 Demo: we would notify you when it’s back in stock.");
                      }}
                    >
                      Notify me
                    </button>
                  )}
                </div>
              </article>
            );
          })}

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
  const [toast, setToast] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);

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

  function showToast(message, type = "success") {
    setToast({ message, type });
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

      showToast("✅ Order placed!");
      setOrdersCount((c) => c + 1);
    } catch {
      showToast("❌ Network error placing order");
    }
  }

  const roleEmoji = user?.role === "admin" ? "👑" : "";

  return (
    <div className="app">
      {toast && (
        <div className={"toast" + (toast.type === "error" ? " toast--error" : "")}>
          {toast.message}
        </div>
      )}

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
              {/* ✅ List Product link with + badge - simplified structure */}
              <NavLink
                to="/products/new"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                List Product
                <span className="plus-badge" aria-label="Add">
                  <span className="plus-icon-wrap">
                    <FiPlus className="plus-icon" />
                  </span>
                </span>

              </NavLink>

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
          <Route
            path="/"
            element={<ProductsPage onBuyNow={handleBuyNow} user={user} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/my-orders"
            element={<MyOrdersPage showToast={showToast} />}
          />

          {/* ✅ New product routes */}
          <Route
            path="/products/new"
            element={<AddProductPage showToast={showToast} />}
          />
          <Route
            path="/products/:id/edit"
            element={<EditProductPage showToast={showToast} />}
          />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2025 MyShop · React + Express demo</p>
      </footer>
    </div>
  );
}
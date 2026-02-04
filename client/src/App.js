import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import MyOrdersPage from "./MyOrdersPage";
import AddProductPage from "./AddProductPage";
import EditProductPage from "./EditProductPage";
import AdminPanelPage from "./AdminPanelPage";
import ReportProductPage from "./ReportProductPage";
import { FiPlus } from "react-icons/fi";
import { FiEdit2 } from "react-icons/fi";
import { FiShield } from "react-icons/fi";

const API_BASE = "http://localhost:5000";

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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const myId = user?.id; // backend stores { id: user._id }
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch products
        const productsRes = await fetch(`${API_BASE}/api/products`);
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const productsData = await productsRes.json();

        // Fetch categories
        const categoriesRes = await fetch(`${API_BASE}/api/products/categories`);
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesRes.json();

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category?.name === selectedCategory);

  return (
    <>
      <section className="categories">
        <button
          key="All"
          className={
            "All" === selectedCategory
              ? "category-button category-button--active"
              : "category-button"
          }
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            className={
              category.name === selectedCategory
                ? "category-button category-button--active"
                : "category-button"
            }
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.name}
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

            const canEdit = isAdmin ? true : isMine;

            // outline logic:
            // - normal user: own -> green
            // - admin: own -> dark red
            // - admin: others -> orange
            const cardClass =
              "product-card" +
              (isAdmin
                ? isMine
                  ? " product-card--admin-mine"
                  : " product-card--admin"
                : isMine
                  ? " product-card--mine"
                  : "");

            return (
              <article
                key={product._id}
                className={cardClass}
                style={{ position: "relative" }}
              >
                {/* Pencil icon top-right (owner/admin only) */}
                {canEdit && (
                  <button
                    type="button"
                    className={
                      "icon-btn" +
                      (isAdmin ? (isMine ? " icon-btn--admin-mine" : " icon-btn--admin") : "")
                    }
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
                <p className="product-category">{product.category?.name || "Uncategorized"}</p>
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

                  <button
                    className="btn-danger-outline"
                    type="button"
                    onClick={() => navigate(`/report/${product._id}`)}
                    title="Report this product"
                  >
                    Report
                  </button>
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
          TechStore
        </NavLink>

        <nav className="nav-links">
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                "nav-link nav-link--admin" + (isActive ? " active" : "")
              }
            >
              Admin Panel
            </NavLink>
          )}

          <NavLink
            to="/products"
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
              {/* ✅ List Product link with + badge - only for sellers and admins */}
              {(user?.role === "seller" || user?.role === "admin") && (
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
              )}

              <NavLink
                to="/my-orders"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                My Orders <span className="badge">{ordersCount}</span>
              </NavLink>

              <span className="nav-link nav-user">
                {user?.role === "admin" && <FiShield className="admin-badge-icon" />}
                <span className="nav-user-name">{user.name}</span>
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
          <Route path="/" element={<HomePage />} />
          <Route
            path="/products"
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
          <Route
            path="/report/:id"
            element={<ReportProductPage showToast={showToast} />}
          />
          <Route path="/admin" element={<AdminPanelPage showToast={showToast} />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2025 TechStore · Discover the latest in technology</p>
      </footer>
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import MyOrdersPage from "./MyOrdersPage";
import AddProductPage from "./AddProductPage";
import EditProductPage from "./EditProductPage";
import AdminPanelPage from "./AdminPanelPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import CheckoutSuccessPage from "./CheckoutSuccessPage";

import { FiPlus, FiEdit2, FiShield, FiShoppingBag, FiShoppingCart, FiList, FiLogIn, FiUserPlus, FiLogOut } from "react-icons/fi";
import { useCart } from "./cart/CartContext";
import MiniCart from "./MiniCart";

const API_BASE = "http://localhost:5000";

// tweak if your navbar is taller/shorter
const NAVBAR_OFFSET_PX = 12;

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

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function ProductsPage({ onAddToCart, user, showToast }) {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const myId = user?.id;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const productsRes = await fetch(`${API_BASE}/api/products`);
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const productsData = await productsRes.json();

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
                {canEdit && (
                  <button
                    type="button"
                    className={
                      "icon-btn" +
                      (isAdmin
                        ? isMine
                          ? " icon-btn--admin-mine"
                          : " icon-btn--admin"
                        : "")
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
                <p className="product-category">
                  {product.category?.name || "Uncategorized"}
                </p>
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

                <p
                  className={
                    "stock-pill " + (product.inStock ? "stock-pill--in" : "stock-pill--out")
                  }
                >
                  {product.inStock ? "✅ In stock" : "⛔ Out of stock"}
                </p>

                <div
                  className={
                    "product-actions" + (!product.inStock ? " product-actions--row" : "")
                  }
                >
                  <button
                    className={"btn-secondary " + (!product.inStock ? "btn-disabled" : "")}
                    disabled={!product.inStock}
                    onClick={() => navigate(`/checkout?buyNow=${product._id}`)}
                    title={!product.inStock ? "Out of stock" : "Buy now"}
                  >
                    Buy Now
                  </button>

                  <button
                    className={"btn-secondary " + (!product.inStock ? "btn-disabled" : "")}
                    disabled={!product.inStock}
                    onClick={() => onAddToCart(product)}
                    title={!product.inStock ? "Out of stock" : "Add to cart"}
                  >
                    Add to Cart
                  </button>

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
  const location = useLocation();

  const { cartCount, addToCart } = useCart();

  const [user, setUser] = useState(readStoredUser());
  const [toast, setToast] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);

  const toastTimerRef = useRef(null);
  const startedAtRef = useRef(0);
  const remainingMsRef = useRef(0);

  const TOAST_MS = 3500;
  const EXTRA_AFTER_HOVER_MS = 1800;

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
  }, [user, location.pathname]);

  function clearToastTimer() {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }

  function startToastTimer(ms) {
    clearToastTimer();
    startedAtRef.current = Date.now();
    remainingMsRef.current = ms;
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      clearToastTimer();
    }, ms);
  }

  function showToast(arg, type = "success") {
    const next =
      typeof arg === "string"
        ? { message: arg, type }
        : {
            message: arg.message,
            type: arg.type || "success",
            onUndo: arg.onUndo,
            undoLabel: arg.undoLabel || "Undo",
            undoneMessage: arg.undoneMessage || "✅ Undid action",
          };

    setToast(next);
    startToastTimer(TOAST_MS);
  }

  function toastPause() {
    if (!toastTimerRef.current) return;
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, remainingMsRef.current - elapsed);
    remainingMsRef.current = remaining;
    clearToastTimer();
  }

  function toastResume() {
    const resumeMs = remainingMsRef.current + EXTRA_AFTER_HOVER_MS;
    startToastTimer(resumeMs);
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

  async function handleAddToCart(product) {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(product, 1);
      showToast(`✅ Added "${product.name}" to cart`);
    } catch (e) {
      showToast(`❌ ${e.message || "Failed to add to cart"}`, "error");
    }
  }

  const isErrorToast = toast?.type === "error";

  return (
    <div className="app">
      {/* Toast */}
      {toast && (
        <div
          className={"toast-wrap"}
          style={{ top: `calc(var(--navbar-height, 64px) + ${NAVBAR_OFFSET_PX}px)` }}
          onMouseEnter={toastPause}
          onMouseLeave={toastResume}
        >
          <div className={"toast" + (isErrorToast ? " toast--error" : "")}>
            <div className="toast-row">
              <span className="toast-msg">{toast.message}</span>

              {toast.onUndo && (
                <button
                  type="button"
                  className="toast-undo"
                  onClick={async () => {
                    try {
                      await toast.onUndo();
                      showToast(toast.undoneMessage);
                    } catch {
                      showToast("❌ Undo failed", "error");
                    }
                  }}
                >
                  {toast.undoLabel || "Undo"}
                </button>
              )}
            </div>

            {/* floating close (positioned via CSS) */}
            <button
              type="button"
              className="toast-close-float"
              aria-label="Dismiss"
              title="Dismiss"
              onClick={() => setToast(null)}
            >
              ×
            </button>
          </div>
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
              <FiShield className="nav-icon" />
              Admin Panel
            </NavLink>
          )}

          <NavLink
            to="/products"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            <FiShoppingBag className="nav-icon" />
            Products
          </NavLink>

          {/* Keep ONLY ONE cart link */}
          <NavLink
            to="/cart"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            <FiShoppingCart className="nav-icon" />
            Cart <span className="badge">{cartCount}</span>
          </NavLink>

          {!user ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                <FiLogIn className="nav-icon" />
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  "nav-link nav-link-primary" + (isActive ? " active" : "")
                }
              >
                <FiUserPlus className="nav-icon" />
                Sign up
              </NavLink>
            </>
          ) : (
            <>
              {(user?.role === "seller" || user?.role === "admin") && (
                <NavLink
                  to="/products/new"
                  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                >
                  <FiPlus className="nav-icon" />
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
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                <FiList className="nav-icon" />
                My Orders <span className="badge">{ordersCount}</span>
              </NavLink>

              <span className="nav-link nav-user">
                {user?.role === "admin" && <FiShield className="admin-badge-icon" />}
                <span className="nav-user-name">{user.name}</span>
              </span>

              <button type="button" className="nav-link-button" onClick={logout}>
                <FiLogOut className="nav-icon" />
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Floating mini-cart (bottom-right) */}
      <MiniCart />

      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/products"
            element={<ProductsPage onAddToCart={handleAddToCart} user={user} showToast={showToast} />}
          />

          <Route path="/cart" element={<CartPage showToast={showToast} />} />

          <Route path="/checkout" element={<CheckoutPage showToast={showToast} />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/my-orders" element={<MyOrdersPage showToast={showToast} />} />

          <Route path="/products/new" element={<AddProductPage showToast={showToast} />} />
          <Route path="/products/:id/edit" element={<EditProductPage showToast={showToast} />} />

          <Route path="/admin" element={<AdminPanelPage showToast={showToast} />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2025 TechStore · Discover the latest in technology</p>
      </footer>
    </div>
  );
}

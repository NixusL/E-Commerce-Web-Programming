import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import MyOrdersPage from "./MyOrdersPage";
import AddProductPage from "./AddProductPage";
import EditProductPage from "./EditProductPage";
import AdminPanelPage from "./AdminPanelPage";
import ReportProductPage from "./ReportProductPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import CheckoutSuccessPage from "./CheckoutSuccessPage";
import SellerRequestPage from "./SellerRequestPage";

import MiniCart from "./MiniCart";

import { FiPlus, FiEdit2, FiShield, FiShoppingCart, FiBox } from "react-icons/fi";
import { useCart } from "./cart/CartContext";

const API_BASE = "http://localhost:5000";

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

/* ---------------- Toast Item (pause-on-hover, animated in/out) ---------------- */
function ToastItem({
  toast,
  onUndo,
  onClose,
  onCartToastClick,
  isCartPage,
}) {
  const [exiting, setExiting] = useState(false);
  const [pressed, setPressed] = useState(false);

  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const remainingRef = useRef(toast.durationMs);

  const isCartToast = toast.intent === "cart";

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function startTimer() {
    clearTimer();
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onClose(toast.id), 220);
    }, remainingRef.current);
  }

  useEffect(() => {
    startTimer();
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMouseEnter() {
    if (!timerRef.current) return;
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimer();
  }

  function handleMouseLeave() {
    if (remainingRef.current <= 0) return;
    startTimer();
  }

  function handleToastClick() {
    // only cart toasts open minicart, and only when NOT on /cart
    if (!isCartToast) return;
    if (isCartPage) return;

    // tap feedback
    setPressed(true);
    window.setTimeout(() => setPressed(false), 160);

    // ✅ close the toast immediately so it won't cover the minicart
    clearTimer();
    setExiting(true);
    window.setTimeout(() => onClose(toast.id), 140);

    // open minicart after a tiny delay (still feels instant)
    window.setTimeout(() => {
      onCartToastClick?.();
    }, 160);
  }

  function handleUndoClick(e) {
    // ✅ Undo should NOT open MiniCart
    e.stopPropagation();
    onUndo(toast.id);
  }

  function handleCloseClick(e) {
    e.stopPropagation();
    clearTimer();
    setExiting(true);
    setTimeout(() => onClose(toast.id), 220);
  }

  return (
    <div
      className={"toast-wrap " + (toast.type === "error" ? "toast--error" : "")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={
          "toast " +
          (exiting ? "toast--exit" : "toast--enter") +
          (toast.type === "error" ? " toast--error" : "") +
          (pressed ? " toast--pressed" : "") +
          (isCartToast && !isCartPage ? " toast--clickable" : "")
        }
        onClick={handleToastClick}
        role={isCartToast && !isCartPage ? "button" : undefined}
        tabIndex={isCartToast && !isCartPage ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleToastClick();
        }}
        title={isCartToast && !isCartPage ? "Open mini cart" : undefined}
      >
        <span className="toast-msg">{toast.message}</span>

        {toast.undoLabel && toast.canUndo && (
          <button type="button" className="toast-undo" onClick={handleUndoClick}>
            {toast.undoLabel}
          </button>
        )}
      </div>

      <button
        type="button"
        className="toast-close-float"
        onClick={handleCloseClick}
        aria-label="Dismiss"
        title="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

/* ---------------- Products Page ---------------- */
function ProductsPage({ user }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const myId = user?.id;
  const isAdmin = user?.role === "admin";

  function pushToast(detail) {
    window.dispatchEvent(new CustomEvent("toast:push", { detail }));
  }

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

  async function handleAddToCart(product) {
    try {
      addToCart(product, 1);

      pushToast({
        intent: "cart",
        type: "success",
        message: `✅ Added "${product.name}" to cart`,
        undoLabel: "Undo",
        canUndo: true,
        onUndo: () => {
          window.dispatchEvent(
            new CustomEvent("cart:undo:add", {
              detail: { productId: product._id || product.id },
            })
          );
        },
      });
    } catch {
      pushToast({
        intent: "cart",
        type: "error",
        message: `❌ Failed to add "${product.name}"`,
        canUndo: false,
      });
    }
  }

  function handleBuyNow(product) {
    try {
      addToCart(product, 1);
    } catch {}
    navigate("/checkout");
  }

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
                  {product.image ? (
                    <img
                      src={
                        product.image.startsWith("http")
                          ? product.image
                          : `${API_BASE}${product.image}`
                      }
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "0.75rem",
                      }}
                    />
                  ) : (
                    <span>{product.emoji || "🛒"}</span>
                  )}
                </div>

                <h2 className="product-name">{product.name}</h2>
                <p className="product-category">
                  {product.category?.name || "Uncategorized"}
                </p>
                <p className="product-desc">{product.description}</p>
                <p className="product-price">{formatPrice(product.price)}</p>

                <div className={"product-actions" + (!product.inStock ? " product-actions--row" : "")}>
                  <button
                    className={"btn-secondary " + (!product.inStock ? "btn-disabled" : "")}
                    disabled={!product.inStock}
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy Now
                  </button>

                  <button
                    className={"btn-secondary " + (!product.inStock ? "btn-disabled" : "")}
                    disabled={!product.inStock}
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>

                  <button
                    className="btn-danger-outline"
                    type="button"
                    onClick={() => navigate(`/report/${product._id}`)}
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
  const { cartCount } = useCart();

  const [user, setUser] = useState(readStoredUser());
  const [ordersCount, setOrdersCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const isCartPage = location.pathname.startsWith("/cart");

  // open MiniCart by "clicking" the FAB
  const openMiniCart = () => {
    const fab = document.querySelector(".mini-cart-fab");
    if (fab) fab.click();
  };

  const pushToast = (t) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const durationMs = typeof t.durationMs === "number" ? t.durationMs : 4500;

    const toast = {
      id,
      intent: t.intent || "default", // "cart" => clickable opens mini cart
      type: t.type || "success",
      message: t.message || "",
      canUndo: !!t.canUndo,
      undoLabel: t.undoLabel || "Undo",
      onUndo: typeof t.onUndo === "function" ? t.onUndo : null,
      durationMs,
    };

    setToasts((prev) => {
      const next = [...prev, toast];
      if (next.length > 5) next.splice(0, next.length - 5);
      return next;
    });

    return id;
  };

  const closeToast = (id) => setToasts((prev) => prev.filter((x) => x.id !== id));

  const undoToast = (id) => {
    setToasts((prev) => {
      const t = prev.find((x) => x.id === id);
      if (!t) return prev;

      try {
        t.onUndo?.();
      } catch {}

      // keep intent so "↩️ Undone" toast is clickable
      return prev.map((x) =>
        x.id === id
          ? {
              ...x,
              message: "↩️ Undone",
              canUndo: false,
              type: "success",
              durationMs: 2500,
            }
          : x
      );
    });
  };

  // ✅ GLOBAL TOAST BUS: any file can dispatch "toast:push"
  useEffect(() => {
    function onToastPush(e) {
      if (!e?.detail) return;
      pushToast(e.detail);
    }
    window.addEventListener("toast:push", onToastPush);
    return () => window.removeEventListener("toast:push", onToastPush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cart undo hooks
  useEffect(() => {
    function onUndoAdd(e) {
      // hook up to your real removeFromCart if you have it
      // removeFromCart(e.detail.productId);
    }
    window.addEventListener("cart:undo:add", onUndoAdd);
    return () => window.removeEventListener("cart:undo:add", onUndoAdd);
  }, []);

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

  const roleEmoji = user?.role === "admin" ? "👑" : "";

  return (
    <div className="app">
      {toasts.length > 0 && (
        <div className="toast-stack">
          {toasts.map((t) => (
            <ToastItem
              key={t.id}
              toast={t}
              onUndo={undoToast}
              onClose={closeToast}
              isCartPage={isCartPage}
              onCartToastClick={openMiniCart}
            />
          ))}
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
              Admin
            </NavLink>
          )}

          <NavLink
            to="/products"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            <FiBox className="nav-icon" />
            Products
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            <FiShoppingCart className="nav-icon" />
            Cart <span className="badge">{cartCount || 0}</span>
          </NavLink>

          {!user ? (
            <>
              <NavLink
                to="/become-seller"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                Become Seller
              </NavLink>

              <NavLink
                to="/login"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
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
              {(user?.role === "seller" || user?.role === "admin") && (
                <NavLink
                  to="/products/new"
                  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
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
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                My Orders <span className="badge">{ordersCount}</span>
              </NavLink>

              <span className="nav-link nav-user">
                {user?.role === "admin" && <FiShield className="admin-badge-icon" />}
                <span className="nav-user-name">
                  {user.name} {roleEmoji}
                </span>
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
          <Route path="/products" element={<ProductsPage user={user} />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/become-seller" element={<SellerRequestPage />} />

          <Route path="/my-orders" element={<MyOrdersPage />} />

          <Route path="/products/new" element={<AddProductPage />} />
          <Route path="/products/:id/edit" element={<EditProductPage />} />

          <Route path="/report/:id" element={<ReportProductPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
        </Routes>
      </main>

      <MiniCart />

      <footer className="footer">
        <p>© 2025 TechStore · Discover the latest in technology</p>
      </footer>
    </div>
  );
}
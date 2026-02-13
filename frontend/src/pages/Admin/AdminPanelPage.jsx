import React, { useEffect, useMemo, useState } from "react";
import {
  FaBox,
  FaShoppingCart,
  FaUserPlus,
  FaTags,
  FaUndo,
} from "react-icons/fa";
import { prettyRefundStatus } from "../../utils/refundStatus";
import { API_BASE, getCurrentUser, pushToast } from "../../services/apiClient";

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || "";
  }
}

// using pushToast from services/apiClient

export default function AdminPanelPage() {
  const [tab, setTab] = useState("products"); // products | orders | users | sellers | categories | sellerRequests | refunds

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // products
  const [products, setProducts] = useState([]);
  const [qProducts, setQProducts] = useState("");
  const [selected, setSelected] = useState(() => new Set());

  // categories
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  // orders
  const [orders, setOrders] = useState([]);
  const [qOrders, setQOrders] = useState("");

  // users
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [newSeller, setNewSeller] = useState({ name: "", email: "", password: "" });

  // expandable orders
  const [expandedOrders, setExpandedOrders] = useState(() => new Set());

  // 🔽 SELLER REQUESTS & REFUNDS
  const [sellerRequests, setSellerRequests] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);

  function toggleOrderExpand(orderId) {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  }

  useEffect(() => {
    loadProducts();
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "products") loadProducts();
    if (tab === "orders") loadOrders();
    if (tab === "categories") loadCategories();
    if (tab === "sellerRequests") loadSellerRequests();
    if (tab === "refunds") loadRefundRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* =============== LOADERS =============== */

  async function loadProducts() {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin") {
      pushToast({ type: "error", message: "❌ Admin access required", canUndo: false });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load products");
      setProducts(Array.isArray(data) ? data : []);
      // ensure categories are loaded so we can map category ids to names
      loadCategories();
      setSelected(new Set());
    } catch (e) {
      setError(e.message || "Network error");
      pushToast({ type: "error", message: `❌ ${e.message || "Network error"}`, canUndo: false });
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin") {
      pushToast({ type: "error", message: "❌ Admin access required", canUndo: false });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Network error");
      pushToast({ type: "error", message: `❌ ${e.message || "Network error"}`, canUndo: false });
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin") {
      pushToast({ type: "error", message: "❌ Admin access required", canUndo: false });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/categories`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Network error");
      pushToast({ type: "error", message: `❌ ${e.message || "Network error"}`, canUndo: false });
    } finally {
      setLoading(false);
    }
  }

  async function loadSellerRequests() {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin") {
      pushToast({ type: "error", message: "❌ Admin access required", canUndo: false });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/seller-requests`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load seller requests");
      setSellerRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Network error");
      pushToast({ type: "error", message: `❌ ${e.message || "Network error"}`, canUndo: false });
    } finally {
      setLoading(false);
    }
  }

  async function loadRefundRequests() {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin") {
      pushToast({ type: "error", message: "❌ Admin access required", canUndo: false });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/refunds`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load refund requests");
      setRefundRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Network error");
      pushToast({ type: "error", message: `❌ ${e.message || "Network error"}`, canUndo: false });
    } finally {
      setLoading(false);
    }
  }

  /* =============== FILTERS =============== */

  const filteredProducts = useMemo(() => {
    const s = qProducts.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => {
      const seller =
        typeof p.createdBy === "object"
          ? `${p.createdBy?.name || ""} ${p.createdBy?.email || ""}`
          : "";
      return (
        (p.name || "").toLowerCase().includes(s) ||
        (p.category?.name || "").toLowerCase().includes(s) ||
        seller.toLowerCase().includes(s)
      );
    });
  }, [products, qProducts]);

  const filteredOrders = useMemo(() => {
    const s = qOrders.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) => {
      const customer =
        typeof o.customer === "object"
          ? `${o.customer?.name || ""} ${o.customer?.email || ""}`
          : "";
      return (
        (o.status || "").toLowerCase().includes(s) ||
        customer.toLowerCase().includes(s) ||
        String(o.total ?? "").toLowerCase().includes(s)
      );
    });
  }, [orders, qOrders]);

  /* =============== SELECTION HELPERS =============== */

  function isSelected(id) {
    return selected.has(id);
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(checked) {
    setSelected(() => {
      if (!checked) return new Set();
      return new Set(products.map((p) => p._id));
    });
  }

  /* =============== PRODUCT ACTIONS =============== */

  async function deleteSelected() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const ok = window.confirm(`Delete ${ids.length} product(s)?`);
    if (!ok) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/products/delete-many`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to delete products");
      pushToast({ type: "success", message: `🗑️ Deleted ${ids.length} product(s)`, canUndo: false });
      await loadProducts();
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Delete failed"}`, canUndo: false });
      setError(e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  /* =============== ORDER ACTIONS =============== */

  async function updateOrderStatus(orderId, status) {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update status");
      pushToast({ type: "success", message: "✅ Order updated", canUndo: false });
      await loadOrders();
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Update failed"}`, canUndo: false });
      setError(e.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteOrder(orderId) {
    const ok = window.confirm("Delete this order?");
    if (!ok) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to delete order");
      pushToast({ type: "success", message: "🗑️ Order deleted", canUndo: false });
      await loadOrders();
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Delete failed"}`, canUndo: false });
      setError(e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  /* =============== USER CREATION =============== */

  async function createAdminUser(e) {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      pushToast({ type: "error", message: "❌ Fill in name, email, and password", canUndo: false });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/users/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newAdmin),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to create admin");
      pushToast({ type: "success", message: "✅ Admin user created!", canUndo: false });
      setNewAdmin({ name: "", email: "", password: "" });
      setTab("products");
    } catch (e2) {
      pushToast({ type: "error", message: `❌ ${e2.message || "Create failed"}`, canUndo: false });
      setError(e2.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function createSellerUser(e) {
    e.preventDefault();
    if (!newSeller.name || !newSeller.email || !newSeller.password) {
      pushToast({ type: "error", message: "❌ Fill in name, email, and password", canUndo: false });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/users/seller`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newSeller),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to create seller");
      pushToast({ type: "success", message: "✅ Seller user created!", canUndo: false });
      setNewSeller({ name: "", email: "", password: "" });
      setTab("products");
    } catch (e2) {
      pushToast({ type: "error", message: `❌ ${e2.message || "Create failed"}`, canUndo: false });
      setError(e2.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  /* =============== CATEGORY ACTIONS =============== */

  async function createCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) {
      pushToast({ type: "error", message: "❌ Enter a category name", canUndo: false });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to create category");
      pushToast({ type: "success", message: "✅ Category created!", canUndo: false });
      setNewCategory("");
      await loadCategories();
    } catch (e2) {
      pushToast({ type: "error", message: `❌ ${e2.message || "Create failed"}`, canUndo: false });
      setError(e2.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(categoryId) {
    const ok = window.confirm("Delete this category?");
    if (!ok) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to delete category");
      pushToast({ type: "success", message: "🗑️ Category deleted", canUndo: false });
      await loadCategories();
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Delete failed"}`, canUndo: false });
      setError(e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  /* =============== SELLER REQUEST ACTIONS =============== */

  async function approveSellerRequest(id) {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/seller-requests/${id}/approve`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to approve");
      pushToast({ type: "success", message: "✅ Seller request approved", canUndo: false });
      await loadSellerRequests();
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Approve failed"}`, canUndo: false });
      setError(e.message || "Approve failed");
    } finally {
      setLoading(false);
    }
  }

  async function rejectSellerRequest(id) {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/seller-requests/${id}/reject`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to reject");
      pushToast({ type: "success", message: "❌ Seller request rejected", canUndo: false });
      await loadSellerRequests();
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Reject failed"}`, canUndo: false });
      setError(e.message || "Reject failed");
    } finally {
      setLoading(false);
    }
  }

  /* =============== REFUND ACTIONS =============== */

  // Step 2: approve refund (seller/admin route)
  /* async function approveRefundStep2(orderId) {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/refund/seller-approve`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to approve refund");
      pushToast({ type: "success", message: "✅ Refund approved (step 2)", canUndo: false });
      await loadRefundRequests();
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Approve failed"}`, canUndo: false });
      setError(e.message || "Approve failed");
    } finally {
      setLoading(false);
    }
  } */

  // Step 3: process refund (admin route)
  async function processRefundStep3(orderId) {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/refund`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to process refund");
      pushToast({ type: "success", message: "💸 Refund processed (step 3)", canUndo: false });
      await loadRefundRequests();
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Refund failed"}`, canUndo: false });
      setError(e.message || "Refund failed");
    } finally {
      setLoading(false);
    }
  }

  /* =============== RENDER =============== */

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <div className="admin-summary">
          <div className="admin-summary-card">
            <div className="admin-summary-label">Products</div>
            <div className="admin-summary-value">{products.length}</div>
          </div>
          <div className="admin-summary-card">
            <div className="admin-summary-label">Orders</div>
            <div className="admin-summary-value">{orders.length}</div>
          </div>
          <div className="admin-summary-card admin-summary-card--warn">
            <div className="admin-summary-label">Pending</div>
            <div className="admin-summary-value">
              {orders.filter((o) => o.status === "pending").length}
            </div>
          </div>
        </div>
        <div>
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">Manage products, orders, and admin users.</p>
        </div>
        <div className="admin-tabs">
          <button
            className={"admin-tab" + (tab === "products" ? " admin-tab--active" : "")}
            onClick={() => setTab("products")}
            type="button"
          >
            <FaBox className="tab-icon" /> Products
          </button>
          <button
            className={"admin-tab" + (tab === "orders" ? " admin-tab--active" : "")}
            onClick={() => setTab("orders")}
            type="button"
          >
            <FaShoppingCart className="tab-icon" /> Orders
          </button>
          <button
            className={"admin-tab" + (tab === "users" ? " admin-tab--active" : "")}
            onClick={() => setTab("users")}
            type="button"
          >
            <FaUserPlus className="tab-icon" /> Create Admin
          </button>
          <button
            className={"admin-tab" + (tab === "sellers" ? " admin-tab--active" : "")}
            onClick={() => setTab("sellers")}
            type="button"
          >
            <FaUserPlus className="tab-icon" /> Create Seller
          </button>
          <button
            className={"admin-tab" + (tab === "categories" ? " admin-tab--active" : "")}
            onClick={() => setTab("categories")}
            type="button"
          >
            <FaTags className="tab-icon" /> Categories
          </button>
          <button
            className={"admin-tab" + (tab === "sellerRequests" ? " admin-tab--active" : "")}
            onClick={() => setTab("sellerRequests")}
            type="button"
          >
            <FaUserPlus className="tab-icon" /> Seller Requests
          </button>
          <button
            className={"admin-tab" + (tab === "refunds" ? " admin-tab--active" : "")}
            onClick={() => setTab("refunds")}
            type="button"
          >
            <FaUndo className="tab-icon" /> Refund Requests
          </button>
        </div>
      </div>

      {error && <div className="admin-alert">{error}</div>}

      {tab === "products" && (
        <div className="admin-card">
          <div className="admin-controls">
            <label className="admin-check">
              <input
                type="checkbox"
                checked={products.length > 0 && selected.size === products.length}
                onChange={(e) => toggleAll(e.target.checked)}
              />
              <span>Select all</span>
            </label>
            <input
              className="admin-search"
              placeholder="Search products (name, category, seller)..."
              value={qProducts}
              onChange={(e) => setQProducts(e.target.value)}
            />
            <button
              type="button"
              className={"btn-danger-outline" + (selected.size === 0 ? " btn-disabled" : "")}
              disabled={selected.size === 0 || loading}
              onClick={deleteSelected}
            >
              Delete Selected ({selected.size})
            </button>
          </div>
          <div className="admin-table">
            <div className="admin-row admin-row--head">
              <div className="admin-cell admin-cell--check"></div>
              <div className="admin-cell">Name</div>
              <div className="admin-cell">Category</div>
              <div className="admin-cell">Price</div>
              <div className="admin-cell">Stock</div>
              <div className="admin-cell">Seller</div>
              <div className="admin-cell">Created</div>
            </div>
            {loading && <div className="admin-empty">Loading...</div>}
            {!loading && filteredProducts.length === 0 && (
              <div className="admin-empty">No products found.</div>
            )}
            {!loading &&
              filteredProducts.map((p) => {
                const sellerName =
                  typeof p.createdBy === "object" ? p.createdBy?.name : "Unknown";
                const sellerEmail =
                  typeof p.createdBy === "object" ? p.createdBy?.email : "";
                return (
                  <div className="admin-row" key={p._id}>
                    <div className="admin-cell admin-cell--check">
                      <input
                        type="checkbox"
                        checked={isSelected(p._id)}
                        onChange={() => toggleOne(p._id)}
                      />
                    </div>
                    <div className="admin-cell">
                      <div className="admin-item">
                        {p.image ? (
                          <img
                            src={`${API_BASE}${p.image}`}
                            alt={p.name}
                            style={{
                              width: "30px",
                              height: "30px",
                              objectFit: "cover",
                              marginRight: "8px",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <span className="admin-emoji">🛒</span>
                        )}
                        <span className="admin-item-name">{p.name}</span>
                      </div>
                    </div>
                        <div className="admin-cell">
                          {(() => {
                            if (typeof p.category === 'object' && p.category) return p.category.name;
                            if (typeof p.category === 'string') {
                              const found = categories.find((c) => String(c._id) === String(p.category));
                              return found ? found.name : 'Unknown';
                            }
                            return 'Unknown';
                          })()}
                        </div>
                    <div className="admin-cell">{formatPrice(p.price)}</div>
                    <div className="admin-cell">
                      <span className={"admin-pill " + (p.inStock ? "admin-pill--in" : "admin-pill--out")}>
                        {p.inStock ? "In stock" : "Out"}
                      </span>
                    </div>
                    <div className="admin-cell">
                      <div className="admin-seller">
                        <div className="admin-seller-name">{sellerName || "Unknown"}</div>
                        {sellerEmail && <div className="admin-seller-email">{sellerEmail}</div>}
                      </div>
                    </div>
                    <div className="admin-cell">{formatDate(p.createdAt)}</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="admin-card">
          <div className="admin-controls">
            <input
              className="admin-search"
              placeholder="Search orders (status, customer, total)..."
              value={qOrders}
              onChange={(e) => setQOrders(e.target.value)}
            />
          </div>
          <div className="admin-table">
            <div className="admin-row admin-row--head admin-row--orders">
              <div className="admin-cell">Customer</div>
              <div className="admin-cell">Total</div>
              <div className="admin-cell">Status</div>
              <div className="admin-cell">Placed</div>
              <div className="admin-cell">Actions</div>
            </div>
            {loading && <div className="admin-empty">Loading...</div>}
            {!loading && filteredOrders.length === 0 && (
              <div className="admin-empty">No orders found.</div>
            )}
            {!loading &&
              filteredOrders.map((o) => {
                const customerName =
                  typeof o.customer === "object" ? o.customer?.name : "Unknown";
                const customerEmail =
                  typeof o.customer === "object" ? o.customer?.email : "";
                return (
                  <React.Fragment key={o._id}>
                    <div className="admin-row admin-row--orders">
                      <div className="admin-cell">
                        <div className="admin-seller">
                          <div className="admin-seller-name">{customerName || "Unknown"}</div>
                          {customerEmail && <div className="admin-seller-email">{customerEmail}</div>}
                        </div>
                      </div>
                      <div className="admin-cell">{formatPrice(o.total)}</div>
                      <div className="admin-cell">
                        <select
                          className="admin-select"
                          value={o.status || "pending"}
                          onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                          disabled={loading}
                        >
                          <option value="pending">pending</option>
                          <option value="processing">processing</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </div>
                      <div className="admin-cell">{formatDate(o.createdAt)}</div>
                      <div className="admin-cell">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => toggleOrderExpand(o._id)}
                        >
                          {expandedOrders.has(o._id) ? "Hide" : "View"}
                        </button>
                      </div>
                      <div className="admin-cell">
                        <button
                          className={"btn-danger-outline" + (loading ? " btn-disabled" : "")}
                          type="button"
                          disabled={loading}
                          onClick={() => deleteOrder(o._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {expandedOrders.has(o._id) && (
                      <div className="admin-order-items">
                        {(o.items || []).length === 0 ? (
                          <div className="admin-empty">No items on this order.</div>
                        ) : (
                          (o.items || []).map((it, idx) => (
                            <div className="admin-order-item" key={idx}>
                              {it.image ? (
                                <img
                                  src={`${API_BASE}${it.image}`}
                                  alt={it.name}
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    objectFit: "cover",
                                    marginRight: "8px",
                                    borderRadius: "8px",
                                  }}
                                />
                              ) : (
                                <span className="admin-emoji">🛒</span>
                              )}
                              <span className="admin-order-name">{it.name}</span>
                              <span className="admin-order-qty">×{it.qty}</span>
                              <span className="admin-order-price">{formatPrice(it.price)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="admin-card admin-card--center">
          <h2 className="admin-card-title">Create Admin User</h2>
          <p className="admin-card-text">
            This creates a real <b>admin</b> account via the admin API (no redirect).
          </p>
          <form className="admin-form" onSubmit={createAdminUser}>
            <label className="admin-form-label">
              Name
              <input
                className="admin-input"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
                placeholder="Admin Name"
              />
            </label>
            <label className="admin-form-label">
              Email
              <input
                className="admin-input"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@example.com"
              />
            </label>
            <label className="admin-form-label">
              Password
              <input
                className="admin-input"
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 6 chars"
              />
            </label>
            <button className="admin-primary" type="submit" disabled={loading}>
              Create Admin
            </button>
          </form>
        </div>
      )}

      {tab === "sellers" && (
        <div className="admin-card admin-card--center">
          <h2 className="admin-card-title">Create Seller User</h2>
          <p className="admin-card-text">
            This creates a real <b>seller</b> account via the admin API (no redirect).
          </p>
          <form className="admin-form" onSubmit={createSellerUser}>
            <label className="admin-form-label">
              Name
              <input
                className="admin-input"
                value={newSeller.name}
                onChange={(e) => setNewSeller((p) => ({ ...p, name: e.target.value }))}
                placeholder="Seller Name"
              />
            </label>
            <label className="admin-form-label">
              Email
              <input
                className="admin-input"
                value={newSeller.email}
                onChange={(e) => setNewSeller((p) => ({ ...p, email: e.target.value }))}
                placeholder="seller@example.com"
              />
            </label>
            <label className="admin-form-label">
              Password
              <input
                className="admin-input"
                type="password"
                value={newSeller.password}
                onChange={(e) => setNewSeller((p) => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 6 chars"
              />
            </label>
            <button className="admin-primary" type="submit" disabled={loading}>
              Create Seller
            </button>
          </form>
        </div>
      )}

      {tab === "categories" && (
        <div className="admin-card">
          <div className="admin-controls">
            <form className="admin-form-inline" onSubmit={createCategory}>
              <input
                className="admin-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
              />
              <button className="admin-primary" type="submit" disabled={loading}>
                Create Category
              </button>
            </form>
          </div>
          <div className="admin-table">
            <div className="admin-row admin-row--head">
              <div className="admin-cell">Name</div>
              <div className="admin-cell">Created</div>
              <div className="admin-cell">Actions</div>
            </div>
            {loading && <div className="admin-empty">Loading...</div>}
            {!loading && categories.length === 0 && (
              <div className="admin-empty">No categories found.</div>
            )}
            {!loading &&
              categories.map((cat) => (
                <div className="admin-row" key={cat._id}>
                  <div className="admin-cell">{cat.name}</div>
                  <div className="admin-cell">{formatDate(cat.createdAt)}</div>
                  <div className="admin-cell">
                    <button
                      className={"btn-danger-outline" + (loading ? " btn-disabled" : "")}
                      type="button"
                      disabled={loading}
                      onClick={() => deleteCategory(cat._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === "sellerRequests" && (
        <div className="admin-card">
          {loading && <div className="admin-empty">Loading...</div>}
          {!loading && sellerRequests.length === 0 && (
            <div className="admin-empty">No pending seller requests.</div>
          )}
          {!loading && sellerRequests.length > 0 && (
            <div className="admin-table">
              <div className="admin-row admin-row--head">
                <div className="admin-cell">User</div>
                <div className="admin-cell">Email</div>
                <div className="admin-cell">Requested</div>
                <div className="admin-cell">Actions</div>
              </div>
              {sellerRequests.map((r) => (
                <div className="admin-row" key={r._id}>
                  <div className="admin-cell">{r.user?.name || "Unknown"}</div>
                  <div className="admin-cell">{r.user?.email || "N/A"}</div>
                  <div className="admin-cell">{formatDate(r.createdAt)}</div>
                  <div className="admin-cell">
                    {String(r.status).toLowerCase() === 'pending' ? (
                      <>
                        <button
                          className="btn-secondary"
                          type="button"
                          disabled={loading}
                          onClick={() => approveSellerRequest(r._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-danger-outline"
                          type="button"
                          disabled={loading}
                          onClick={() => rejectSellerRequest(r._id)}
                          style={{ marginLeft: "8px" }}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={"admin-pill " + (r.status === 'approved' ? '' : 'admin-pill--in')}>
                        {r.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "refunds" && (
        <div className="admin-card">
          {loading && <div className="admin-empty">Loading...</div>}
          {!loading && refundRequests.length === 0 && (
            <div className="admin-empty">No refund requests found.</div>
          )}
          {!loading && refundRequests.length > 0 && (
            <div className="admin-table">
              <div className="admin-row admin-row--head">
                <div className="admin-cell">Order ID</div>
                <div className="admin-cell">Customer</div>
                <div className="admin-cell">Amount</div>
                <div className="admin-cell">Refund Status</div>
                <div className="admin-cell">Created</div>
                <div className="admin-cell">Actions</div>
              </div>
              {refundRequests.map((o) => {
                const customerName =
                  typeof o.customer === "object" ? o.customer?.name : "Unknown";
                const rs = String(o.refundStatus || "none").toLowerCase();

                return (
                  <div className="admin-row" key={o._id}>
                    <div className="admin-cell">{o._id}</div>
                    <div className="admin-cell">{customerName || "Unknown"}</div>
                    <div className="admin-cell">{formatPrice(o.total)}</div>
                    <div className="admin-cell">
                      <span
                        className={
                          "admin-pill " +
                          (rs === "seller_approved"
                            ? ""
                            : rs === "pending"
                              ? "admin-pill--warn"
                              : "admin-pill--in")
                        }
                      >
                        {prettyRefundStatus(o.refundStatus)}
                      </span>
                    </div>
                    <div className="admin-cell">{formatDate(o.createdAt)}</div>
                    <div className="admin-cell">
                      {rs === "seller_approved" && (
                        <button
                          className="btn-secondary"
                          type="button"
                          disabled={loading}
                          onClick={() => processRefundStep3(o._id)}
                        >
                          Process Refund (Step 3)
                        </button>
                      )}

                      {rs === "pending" && (
                        <button className="btn-secondary btn-disabled" type="button" disabled>
                          Waiting on seller
                        </button>
                      )}

                      {rs === "refunded" && (
                        <button className="btn-secondary btn-disabled" type="button" disabled>
                          Refunded
                        </button>
                      )}

                      {rs === "none" && (
                        <button className="btn-secondary btn-disabled" type="button" disabled>
                          No action
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

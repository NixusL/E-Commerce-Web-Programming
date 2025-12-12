// client/src/AdminPanelPage.js
import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000";

function getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

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

export default function AdminPanelPage({ showToast }) {
    const token = getToken();

    const [tab, setTab] = useState("products"); // products | orders | users
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // products
    const [products, setProducts] = useState([]);
    const [qProducts, setQProducts] = useState("");
    const [selected, setSelected] = useState(() => new Set());

    // orders
    const [orders, setOrders] = useState([]);
    const [qOrders, setQOrders] = useState("");
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });

    const [expandedOrders, setExpandedOrders] = useState(() => new Set());

    function toggleOrderExpand(orderId) {
        setExpandedOrders((prev) => {
            const next = new Set(prev);
            next.has(orderId) ? next.delete(orderId) : next.add(orderId);
            return next;
        });
    }

    useEffect(() => {
        // ✅ load summary counts immediately
        loadProducts();
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (tab === "products") loadProducts();
        if (tab === "orders") loadOrders();
        // users tab is a simple CTA (redirect)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    async function loadProducts() {
        if (!token) return;
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_BASE}/api/admin/products`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => []);
            if (!res.ok) throw new Error(data?.message || "Failed to load products");
            setProducts(Array.isArray(data) ? data : []);
            setSelected(new Set());
        } catch (e) {
            setError(e.message || "Network error");
        } finally {
            setLoading(false);
        }
    }

    async function loadOrders() {
        if (!token) return;
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_BASE}/api/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => []);
            if (!res.ok) throw new Error(data?.message || "Failed to load orders");
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || "Network error");
        } finally {
            setLoading(false);
        }
    }

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
                (p.category || "").toLowerCase().includes(s) ||
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
            return new Set(products.map((p) => p._id)); // ✅ all products, not just filtered
        });
    }

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
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ids }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to delete products");

            showToast?.(`🗑️ Deleted ${ids.length} product(s)`);
            await loadProducts();
        } catch (e) {
            showToast?.(`❌ ${e.message || "Delete failed"}`, "error");
            setError(e.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    }

    async function updateOrderStatus(orderId, status) {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to update status");

            showToast?.("✅ Order updated");
            await loadOrders();
        } catch (e) {
            showToast?.(`❌ ${e.message || "Update failed"}`, "error");
            setError(e.message || "Update failed");
        } finally {
            setLoading(false);
        }
    }

    async function createAdminUser(e) {
        e.preventDefault();

        if (!token) {
            showToast?.("❌ Not logged in", "error");
            return;
        }

        if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
            showToast?.("❌ Fill in name, email, and password", "error");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_BASE}/api/admin/users/admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newAdmin),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to create admin");

            showToast?.("✅ Admin user created!");
            setNewAdmin({ name: "", email: "", password: "" });
            setTab("products");
        } catch (e2) {
            showToast?.(`❌ ${e2.message || "Create failed"}`, "error");
            setError(e2.message || "Create failed");
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
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to delete order");

            showToast?.("🗑️ Order deleted");
            await loadOrders();
        } catch (e) {
            showToast?.(`❌ ${e.message || "Delete failed"}`, "error");
            setError(e.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    }

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
                        Products
                    </button>
                    <button
                        className={"admin-tab" + (tab === "orders" ? " admin-tab--active" : "")}
                        onClick={() => setTab("orders")}
                        type="button"
                    >
                        Orders
                    </button>
                    <button
                        className={"admin-tab" + (tab === "users" ? " admin-tab--active" : "")}
                        onClick={() => setTab("users")}
                        type="button"
                    >
                        Create Admin
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
                        <div className="admin-row admin-row--head admin-row--orders">
                            <div className="admin-cell">Customer</div>
                            <div className="admin-cell">Total</div>
                            <div className="admin-cell">Status</div>
                            <div className="admin-cell">Placed</div>
                            <div className="admin-cell">Items</div>
                            <div className="admin-cell">Actions</div>
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
                                                <span className="admin-emoji">{p.emoji || "🛒"}</span>
                                                <span className="admin-item-name">{p.name}</span>
                                            </div>
                                        </div>

                                        <div className="admin-cell">{p.category}</div>
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
                                                            <span className="admin-emoji">{it.emoji || "🛒"}</span>
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
        </div>
    );
}
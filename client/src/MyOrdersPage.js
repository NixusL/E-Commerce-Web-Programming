import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// status -> style (quick glance)
function statusStyle(status) {
  const s = String(status || "").toLowerCase();

  if (s === "pending") {
    return { border: "#f59e0b", text: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)" };
  }
  if (s === "cancelled" || s === "canceled") {
    return { border: "#ef4444", text: "#fca5a5", bg: "rgba(239, 68, 68, 0.12)" };
  }
  if (s === "completed" || s === "delivered" || s === "shipped" || s === "paid") {
    return { border: "#22c55e", text: "#86efac", bg: "rgba(34, 197, 94, 0.12)" };
  }
  if (s === "processing") {
    return { border: "#60a5fa", text: "#bfdbfe", bg: "rgba(96, 165, 250, 0.12)" };
  }
  if (s === "refunded") {
    return { border: "#22c55e", text: "#86efac", bg: "rgba(34, 197, 94, 0.12)" };
  }

  // fallback
  return { border: "#6b7280", text: "#d1d5db", bg: "rgba(107, 114, 128, 0.12)" };
}

// refund status -> style
function refundStyle(refundStatus) {
  const s = String(refundStatus || "").toLowerCase();

  if (s === "pending") {
    return { border: "#f59e0b", text: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)" };
  }
  if (s === "approved") {
    return { border: "#60a5fa", text: "#bfdbfe", bg: "rgba(96, 165, 250, 0.12)" };
  }
  if (s === "refunded") {
    return { border: "#22c55e", text: "#86efac", bg: "rgba(34, 197, 94, 0.12)" };
  }
  if (s === "denied" || s === "rejected") {
    return { border: "#ef4444", text: "#fca5a5", bg: "rgba(239, 68, 68, 0.12)" };
  }

  // fallback / "none"
  return { border: "#6b7280", text: "#d1d5db", bg: "rgba(107, 114, 128, 0.12)" };
}

export default function MyOrdersPage({ showToast }) {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to load orders.");
        return;
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cancelOrder(orderId) {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (showToast) showToast(`❌ ${data?.message || "Failed to cancel order"}`);
        else alert(data?.message || "Failed to cancel order.");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );

      if (showToast) showToast("❌ Order cancelled");
    } catch {
      if (showToast) showToast("❌ Network error cancelling order");
      else alert("Network error cancelling order.");
    }
  }

  async function requestRefund(orderId) {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/refund/request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (showToast) showToast(`❌ ${data?.message || "Failed to request refund"}`);
        else alert(data?.message || "Failed to request refund.");
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, refundStatus: "pending", refundRequested: true } : o
        )
      );

      if (showToast) showToast("↩️ Refund requested - awaiting seller approval");
    } catch {
      if (showToast) showToast("❌ Network error requesting refund");
      else alert("Network error requesting refund.");
    }
  }

  if (loading) return <p className="no-products">Loading orders...</p>;
  if (error) return <p className="no-products">Error: {error}</p>;

  return (
    <div className="my-orders-page">
      <h2 className="my-orders-title">My Orders</h2>

      {orders.length === 0 ? (
        <p className="no-orders">No orders yet.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => {
            const image = o.items?.[0]?.image || "";
            const cancellable = ["pending", "processing"].includes(String(o.status || "").toLowerCase());

            const canRequestRefund =
              (o.refundStatus === "none" || !o.refundStatus) &&
              ["completed", "paid"].includes(String(o.status || "").toLowerCase());

            const statusClass = `status-${String(o.status || "").toLowerCase()}`;
            const refundClass = o.refundStatus && o.refundStatus !== "none" ? `refund-${String(o.refundStatus || "").toLowerCase()}` : "";

            return (
              <div key={o._id} className="order-card">
                <div className="order-header">
                  {image ? (
                    <img
                      src={`http://localhost:5000${image}`}
                      alt="Product"
                      className="order-image"
                    />
                  ) : (
                    <div className="order-image-placeholder">🛒</div>
                  )}

                  <span className={`status-badge ${statusClass}`}>
                    {o.status}
                  </span>

                  {o.refundStatus && o.refundStatus !== "none" && (
                    <span className={`refund-badge ${refundClass}`}>
                      Refund: {o.refundStatus}
                    </span>
                  )}

                  <span className="order-total">
                    Total: ${Number(o.total).toFixed(2)}
                  </span>
                </div>

                <div className="order-date">
                  {new Date(o.createdAt).toLocaleString()}
                </div>

                <ul className="order-items">
                  {(o.items || []).map((it, idx) => (
                    <li key={idx} className="order-item">
                      <span className="order-item-name">{it.name}</span>
                      <span className="order-item-details">× {it.qty} — ${Number(it.price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <div className="order-actions">
                  {cancellable && (
                    <button
                      type="button"
                      onClick={() => cancelOrder(o._id)}
                      className="btn-cancel"
                    >
                      Cancel Order
                    </button>
                  )}

                  {canRequestRefund && (
                    <button
                      type="button"
                      onClick={() => requestRefund(o._id)}
                      className="btn-refund"
                    >
                      Request Refund
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

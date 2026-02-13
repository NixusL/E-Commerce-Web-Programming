import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { prettyRefundStatus } from "../../utils/refundStatus";
import { API_BASE, getToken } from "../../services/apiClient";

// (statusStyle and refundStyle removed — not used)

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
      <div className="orders-header">
        <h2 className="my-orders-title">My Orders</h2>
        <p className="orders-subtitle">Track and manage your purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders-container">
          <div className="no-orders-icon">📦</div>
          <p className="no-orders">No orders yet.</p>
          <p className="no-orders-sub">Start shopping to see your orders here!</p>
        </div>
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
                  <div className="order-image-section">
                    {image ? (
                      <img
                        src={`${API_BASE}${image}`}
                        alt="Product"
                        className="order-image"
                      />
                    ) : (
                      <div className="order-image-placeholder">🛒</div>
                    )}
                  </div>

                  <div className="order-info-section">
                    <div className="order-badges">
                      <span className={`status-badge ${statusClass}`}>
                        {o.status}
                      </span>

                      {o.refundStatus && o.refundStatus !== "none" && (
                        <span className={`refund-badge ${refundClass}`}>
                          Refund: {prettyRefundStatus(o.refundStatus)}
                        </span>
                      )}
                    </div>

                    <div className="order-total-price">
                      <span className="order-total-label">Total:</span>
                      <span className="order-total-amount">${Number(o.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-date">
                    <span className="date-label">Ordered on:</span> {new Date(o.createdAt).toLocaleString()}
                  </div>

                  <div className="order-items-section">
                    <h4 className="items-title">Items:</h4>
                    <ul className="order-items">
                      {(o.items || []).map((it, idx) => (
                        <li key={idx} className="order-item">
                          <span className="order-item-name">{it.name}</span>
                          <span className="order-item-details">× {it.qty} — ${Number(it.price).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

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

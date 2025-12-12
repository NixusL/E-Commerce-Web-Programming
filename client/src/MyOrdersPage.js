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
  if (s === "completed" || s === "delivered" || s === "shipped") {
    return { border: "#22c55e", text: "#86efac", bg: "rgba(34, 197, 94, 0.12)" };
  }
  if (s === "processing") {
    return { border: "#60a5fa", text: "#bfdbfe", bg: "rgba(96, 165, 250, 0.12)" };
  }

  // fallback
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

      // update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );

      if (showToast) showToast("❌ Order cancelled");
    } catch {
      if (showToast) showToast("❌ Network error cancelling order");
      else alert("Network error cancelling order.");
    }
  }

  if (loading) return <p className="no-products">Loading orders...</p>;
  if (error) return <p className="no-products">Error: {error}</p>;

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>My Orders</h2>

      {orders.length === 0 ? (
        <p className="no-products">No orders yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {orders.map((o) => {
            const emoji = o.items?.[0]?.emoji || "🛒";
            const cancellable = ["pending", "processing"].includes(o.status);

            const st = statusStyle(o.status);

            return (
              <div
                key={o._id}
                style={{
                  border: "1px solid #1f2937",
                  borderRadius: "1rem",
                  padding: "1rem",
                  position: "relative",
                }}
              >
                {/* emoji top-left */}
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    fontSize: "1.35rem",
                  }}
                  aria-label="product-emoji"
                >
                  {emoji}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingLeft: "2.2rem",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {/* status pill */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.25rem 0.7rem",
                      borderRadius: "999px",
                      border: `1px solid ${st.border}`,
                      color: st.text,
                      background: st.bg,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {o.status}
                  </span>

                  <span style={{ marginLeft: "auto" }}>
                    Total: ${Number(o.total).toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    color: "#9ca3af",
                    marginTop: "0.4rem",
                    paddingLeft: "2.2rem",
                  }}
                >
                  {new Date(o.createdAt).toLocaleString()}
                </div>

                <ul style={{ marginTop: "0.75rem", paddingLeft: "2.2rem" }}>
                  {o.items.map((it, idx) => (
                    <li key={idx}>
                      {it.name} × {it.qty} — ${Number(it.price).toFixed(2)}
                    </li>
                  ))}
                </ul>

                {/* Centered cancel button */}
                {cancellable && (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={() => cancelOrder(o._id)}
                      style={{
                        marginTop: "0.75rem",
                        borderRadius: "999px",
                        padding: "0.5rem 1.1rem",
                        border: "1px solid #ef4444",
                        background: "transparent",
                        color: "#fecaca",
                        cursor: "pointer",
                      }}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { prettyRefundStatus } from "./utils/refundStatus";

const API_BASE = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
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

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || "";
  }
}

// global toast helper (matches your app bus)
function pushToast(detail) {
  window.dispatchEvent(new CustomEvent("toast:push", { detail }));
}

export default function SellerRefundsPage() {
  const navigate = useNavigate();
  const token = getToken();
  const user = readStoredUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  async function load() {
    if (!token || !user) {
      navigate("/login");
      return;
    }
    if (!(user.role === "seller" || user.role === "admin")) {
      pushToast({ type: "error", message: "❌ Only sellers/admin can view this page", canUndo: false });
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/orders/refunds/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load pending refunds");

      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approveRefundAsSeller(orderId) {
    try {
      const ok = window.confirm("Approve this refund request?");
      if (!ok) return;

      const res = await fetch(`${API_BASE}/api/orders/${orderId}/refund/seller-approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to approve refund");

      pushToast({ type: "success", message: "✅ Refund approved (seller)", canUndo: false });

      // remove from list
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Approve failed"}`, canUndo: false });
    }
  }

  if (loading) return <p className="no-products">Loading pending refunds...</p>;
  if (error) return <p className="no-products">Error: {error}</p>;

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Pending Refund Requests (Seller)</h2>

      {orders.length === 0 ? (
        <p className="no-products">No pending refund requests for your products.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {orders.map((o) => (
            <div
              key={o._id}
              style={{
                border: "1px solid #1f2937",
                borderRadius: "1rem",
                padding: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Order: {o._id}</div>
                  <div style={{ color: "#9ca3af", marginTop: "0.25rem" }}>
                    Created: {formatDate(o.createdAt)}
                  </div>
                  <div style={{ color: "#9ca3af", marginTop: "0.25rem" }}>
                    Customer: {o.customer?.name || "Unknown"} {o.customer?.email ? `(${o.customer.email})` : ""}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>${Number(o.total || 0).toFixed(2)}</div>
                  <div style={{ marginTop: "0.25rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.25rem 0.7rem",
                        borderRadius: "999px",
                        border: "1px solid #f59e0b",
                        color: "#fbbf24",
                        background: "rgba(245, 158, 11, 0.12)",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      Refund: {prettyRefundStatus(o.refundStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <ul style={{ marginTop: "0.75rem" }}>
                {(o.items || []).map((it, idx) => (
                  <li key={idx}>
                    {it.name} × {it.qty} — ${Number(it.price).toFixed(2)}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "0.75rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => approveRefundAsSeller(o._id)}
                >
                  Accept Refund (Approve)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

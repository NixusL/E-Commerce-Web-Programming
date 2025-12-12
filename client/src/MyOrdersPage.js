import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    async function load() {
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

        setOrders(data);
      } catch {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  if (loading) return <p className="no-products">Loading orders...</p>;
  if (error) return <p className="no-products">Error: {error}</p>;

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>My Orders</h2>

      {orders.length === 0 ? (
        <p className="no-products">No orders yet.</p>
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Status: {o.status}</strong>
                <span>Total: ${Number(o.total).toFixed(2)}</span>
              </div>

              <div style={{ color: "#9ca3af", marginTop: "0.4rem" }}>
                {new Date(o.createdAt).toLocaleString()}
              </div>

              <ul style={{ marginTop: "0.75rem" }}>
                {o.items.map((it, idx) => (
                  <li key={idx}>
                    {it.name} × {it.qty} — ${Number(it.price).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
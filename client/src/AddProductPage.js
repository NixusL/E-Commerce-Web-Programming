// client/src/AddProductPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export default function AddProductPage({ showToast }) {
  const navigate = useNavigate();
  const token = getToken();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Accessories",
    description: "",
    emoji: "🛒",
    inStock: true,
  });

  const [error, setError] = useState("");

  if (!token) {
    navigate("/login");
    return null;
  }

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to create product");
        return;
      }

      if (showToast) showToast("✅ Product listed!");
      navigate("/");
    } catch {
      setError("Network error");
    }
  }

  return (
    <div className="form-card">
      <h1 className="form-title">List a Product</h1>
      <p className="form-subtitle">Create a product you want to sell.</p>

      <form className="auth-form form-grid" onSubmit={onSubmit}>
        <label className="auth-label">
          Title
          <input
            className="auth-input"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Gaming Desk"
            required
          />
        </label>

        <label className="auth-label">
          Price
          <input
            className="auth-input"
            type="number"
            step="1"
            min="0"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            placeholder="259.99"
            required
          />
        </label>

        <label className="auth-label">
          Category
          <input
            className="auth-input"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            placeholder="Accessories"
          />
        </label>

        <label className="auth-label">
          Description
          <textarea
            className="auth-input"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Short description..."
            rows={3}
          />
        </label>

        <label className="auth-label">
          Emoji (temporary)
          <input
            className="auth-input"
            value={form.emoji}
            onChange={(e) => setField("emoji", e.target.value)}
            placeholder="🎮"
          />
        </label>

        <label className="auth-check">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => setField("inStock", e.target.checked)}
          />
          <span>In stock</span>
        </label>

        {error && <p style={{ color: "#fca5a5", margin: 0 }}>{error}</p>}

        <div className="form-actions">
          <button className="auth-primary-button" type="submit">
            Create Product
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
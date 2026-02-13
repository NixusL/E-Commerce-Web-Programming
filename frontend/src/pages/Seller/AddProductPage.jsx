import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, getCurrentUser, pushToast } from "../../services/apiClient";

export default function AddProductPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: null,
    stock: "",
  });

  const [categories, setCategories] = useState([]);
  const [brand, setBrand] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check auth & role using cookie-based session
    async function checkAuth() {
      const me = await getCurrentUser();
      if (!me) {
        navigate("/login");
        return;
      }
      if (me.role !== "seller" && me.role !== "admin") {
        pushToast({
          type: "error",
          message: "❌ Only sellers and admins can create products",
          canUndo: false,
        });
        navigate("/");
        return;
      }
      setUserRole(me.role);
      setAuthChecked(true);
    }

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/products/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch {
        setError("Failed to load categories");
        pushToast({
          type: "error",
          message: "❌ Failed to load categories",
          canUndo: false,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (userRole !== "seller" && userRole !== "admin") {
      setError("Only sellers and admins can create products");
      pushToast({
        type: "error",
        message: "❌ Only sellers and admins can create products",
        canUndo: false,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      if (brand) formData.append("brand", brand);
      formData.append("description", form.description);
      formData.append("stock", form.stock);
      if (form.image) formData.append("image", form.image);

      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to create product");
        pushToast({
          type: "error",
          message: `❌ ${data?.message || "Failed to create product"}`,
          canUndo: false,
        });
        return;
      }

      pushToast({
        type: "success",
        message: `✅ Listed "${form.name}"`,
        canUndo: false,
      });

      navigate("/");
    } catch {
      setError("Network error");
      pushToast({
        type: "error",
        message: "❌ Network error",
        canUndo: false,
      });
    }
  }

  return (
    <div className="add-product-container">
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
          <select
            className="auth-input"
            value={form.category}
            onChange={(e) => { setField("category", e.target.value); setBrand(""); }}
            required
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {form.category && (
          <label className="auth-label">
            Brand
            <select
              className="auth-input"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select a brand</option>
              {(categories.find(c => c.name === form.category)?.brands || []).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>
        )}

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
          Product Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setField("image", e.target.files[0])}
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          Stock Quantity
          <input
            className="auth-input"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setField("stock", e.target.value)}
            placeholder="0"
            required
          />
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
    </div>
  );
}

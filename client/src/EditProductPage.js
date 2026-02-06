import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CATEGORIES } from "./constants/categories";

const API_BASE = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function getUser() {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function pushToast(detail) {
  window.dispatchEvent(new CustomEvent("toast:push", { detail }));
}

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const token = getToken();
  const user = getUser();

  const [form, setForm] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryMode, setCategoryMode] = useState("preset"); // preset | custom
  const [customCategory, setCustomCategory] = useState("");

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  useEffect(() => {
    async function load() {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/products/${id}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.message || "Failed to load product");
          pushToast({
            type: "error",
            message: `❌ ${data?.message || "Failed to load product"}`,
            canUndo: false,
          });
          return;
        }

        const createdById =
          typeof data.createdBy === "string" ? data.createdBy : data.createdBy?._id;

        setOwnerId(createdById || null);

        setForm({
          name: data.name || "",
          price: data.price ?? "",
          category: data.category || "Uncategorized",
          description: data.description || "",
          image: null,
          stock: data.stock ?? "",
          inStock: data.inStock ?? true,
        });

        const preset = CATEGORIES.includes(data.category);
        setCategoryMode(preset ? "preset" : "custom");
        setCustomCategory(preset ? "" : data.category || "");
      } catch {
        setError("Network error");
        pushToast({ type: "error", message: "❌ Network error", canUndo: false });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, token, navigate]);

  const isAdmin = user?.role === "admin";
  const isOwner = ownerId && user?.id && String(ownerId) === String(user.id);
  const canDelete = isAdmin || isOwner;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("stock", form.stock);
      formData.append("inStock", form.inStock);
      if (form.image) formData.append("image", form.image);

      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Failed to update product");
        pushToast({
          type: "error",
          message: `❌ ${data?.message || "Failed to update product"}`,
          canUndo: false,
        });
        return;
      }

      pushToast({
        type: "success",
        message: `✅ Updated "${form.name}"`,
        canUndo: false,
      });

      navigate("/");
    } catch {
      setError("Network error");
      pushToast({ type: "error", message: "❌ Network error", canUndo: false });
    }
  }

  async function onDelete() {
    if (!canDelete) return;

    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 409) {
          pushToast({
            type: "error",
            message: `⚠️ ${data?.message || "Cannot delete this product."}`,
            canUndo: false,
          });
        } else {
          pushToast({
            type: "error",
            message: `❌ ${data?.message || "Failed to delete product"}`,
            canUndo: false,
          });
        }

        setError(data?.message || "Failed to delete product");
        return;
      }

      pushToast({ type: "success", message: "🗑️ Product deleted", canUndo: false });
      navigate("/");
    } catch {
      setError("Network error");
      pushToast({ type: "error", message: "❌ Network error", canUndo: false });
    }
  }

  if (loading) return <p className="no-products">Loading product...</p>;
  if (error && !form) return <p className="no-products">Error: {error}</p>;
  if (!form) return null;

  return (
    <div className="form-card">
      <h1 className="form-title">Edit Product</h1>
      <p className="form-subtitle">Update your listing details.</p>

      <form className="auth-form form-grid" onSubmit={onSubmit}>
        <label className="auth-label">
          Title
          <input
            className="auth-input"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
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
            required
          />
        </label>

        <label className="auth-label">
          Category
          <select
            className="auth-input"
            value={categoryMode === "preset" ? form.category : "__custom__"}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__custom__") {
                setCategoryMode("custom");
                setField("category", "");
                setCustomCategory("");
              } else {
                setCategoryMode("preset");
                setField("category", v);
                setCustomCategory("");
              }
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__custom__">Other (type)</option>
          </select>
        </label>

        {categoryMode === "custom" && (
          <label className="auth-label">
            Custom Category
            <input
              className="auth-input"
              value={customCategory}
              onChange={(e) => {
                setCustomCategory(e.target.value);
                setField("category", e.target.value);
              }}
              placeholder="e.g. Furniture"
              required
            />
          </label>
        )}

        <label className="auth-label">
          Description
          <textarea
            className="auth-input"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
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
            Save Changes
          </button>

          <button className="btn-secondary" type="button" onClick={() => navigate("/")}>
            Back
          </button>
        </div>

        {canDelete && (
          <button type="button" className="btn-danger-full" onClick={onDelete}>
            Delete Product
          </button>
        )}
      </form>
    </div>
  );
}

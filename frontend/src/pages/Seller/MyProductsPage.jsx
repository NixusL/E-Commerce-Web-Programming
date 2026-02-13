import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { API_BASE, getToken, pushToast } from "../../services/apiClient";

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

// use pushToast from services/apiClient

export default function MyProductsPage() {
  const navigate = useNavigate();
  const token = getToken();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMyProducts() {
    if (!token) {
      pushToast({ type: "error", message: "❌ Not logged in", canUndo: false });
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/products/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load products");
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Network error");
      pushToast({ type: "error", message: `❌ ${e.message || "Network error"}`, canUndo: false });
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(productId) {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to delete product");
      pushToast({ type: "success", message: "🗑️ Product deleted", canUndo: false });
      await loadMyProducts();
    } catch (e) {
      pushToast({ type: "error", message: `❌ ${e.message || "Delete failed"}`, canUndo: false });
      setError(e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-products-page" style={{ padding: "3rem 5%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600" }}>My Products</h1>
        <button
          onClick={() => navigate("/products/new")}
          style={{
            background: "black",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "500"
          }}
        >
          <FiPlus /> Add Product
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

      {loading && <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>}

      {!loading && products.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem", color: "#909090" }}>
          <p>You haven't added any products yet.</p>
          <button
            onClick={() => navigate("/products/new")}
            style={{
              background: "black",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "1rem"
            }}
          >
            Add Your First Product
          </button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
          {products.map((product) => (
            <div
              key={product._id}
              className="product-card-cyber"
              style={{
                background: "#f6f6f6",
                borderRadius: "12px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                transition: "transform 0.2s"
              }}
            >
              {/* Product Image */}
              <div className="product-img-box" style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <img
                  src={product.image ? `${API_BASE}${product.image}` : "/placeholder.png"}
                  alt={product.name}
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                />
              </div>

              {/* Product Name */}
              <h3 className="product-title" style={{ fontWeight: "600", fontSize: "1rem", marginBottom: "0.5rem", lineHeight: "1.4" }}>
                {product.name}
              </h3>

              {/* Price */}
              <div className="product-price" style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>
                {formatPrice(product.price)}
              </div>

              {/* Stock Status */}
              <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: product.inStock ? "green" : "red" }}>
                {product.inStock ? `In Stock (${product.stock})` : "Out of Stock"}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <button
                  onClick={() => navigate(`/products/${product._id}/edit`)}
                  style={{
                    flex: 1,
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px"
                  }}
                >
                  <FiEdit size={14} /> Edit
                </button>
                <button
                  onClick={() => deleteProduct(product._id)}
                  style={{
                    flex: 1,
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px"
                  }}
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>

              {/* Created Date */}
              <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#909090" }}>
                Created: {formatDate(product.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

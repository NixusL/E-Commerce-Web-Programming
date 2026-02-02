// client/src/AddProductPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmojiSelect from "./components/EmojiSelect";

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
        category: "",
        description: "",
        emoji: "🛒",
        inStock: true,
    });

    const [error, setError] = useState("");
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [categoryMode, setCategoryMode] = useState("preset"); // preset | custom
    const [customCategory, setCustomCategory] = useState("");

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch(`${API_BASE}/api/admin/categories`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                    if (data.length > 0) {
                        setField("category", data[0].name);
                    }
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            } finally {
                setLoadingCategories(false);
            }
        }
        loadCategories();
    }, [token]);

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
                    {loadingCategories ? (
                        <p style={{ color: "#888", margin: "0.5rem 0 0" }}>Loading categories...</p>
                    ) : categories.length === 0 ? (
                        <p style={{ color: "#f87171", margin: "0.5rem 0 0" }}>No categories created yet</p>
                    ) : (
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
                                }
                            }}
                        >
                            {categories.map((c) => (
                                <option key={c._id} value={c.name}>
                                    {c.emoji || "📦"} {c.name}
                                </option>
                            ))}
                            <option value="__custom__">Other (type)</option>
                        </select>
                    )}
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
                        placeholder="Short description..."
                        rows={3}
                    />
                </label>

                <label className="auth-label">
                    Emoji
                    <EmojiSelect
                        value={form.emoji}
                        onChange={(emoji) => setField("emoji", emoji)}
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
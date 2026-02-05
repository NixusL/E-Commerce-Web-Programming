// client/src/AddProductPage.js
import React, { useState, useEffect } from "react";
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
        category: "",
        description: "",
        image: null,
        stock: "",
    });

    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/api/products/categories`);
                if (!res.ok) throw new Error("Failed to fetch categories");
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                setError("Failed to load categories");
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

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
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('price', form.price);
            formData.append('category', form.category);
            formData.append('description', form.description);
            formData.append('stock', form.stock);
            if (form.image) {
                formData.append('image', form.image);
            }

            const res = await fetch(`${API_BASE}/api/products`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
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
                    <select
                        className="auth-input"
                        value={form.category}
                        onChange={(e) => setField("category", e.target.value)}
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
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
    );
}
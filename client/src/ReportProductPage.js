import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaFlag } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export default function ReportProductPage({ showToast }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            showToast?.("❌ Please log in to report products", "error");
            navigate("/");
            return;
        }
        loadProduct();
    }, [id, token, navigate, showToast]);

    async function loadProduct() {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_BASE}/api/products/${id}`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to load product");
            setProduct(data);
        } catch (e) {
            setError(e.message || "Network error");
        } finally {
            setLoading(false);
        }
    }

    async function submitReport(e) {
        e.preventDefault();

        if (!reason) {
            showToast?.("❌ Please select a reason", "error");
            return;
        }

        if (reason === "other" && !customReason.trim()) {
            showToast?.("❌ Please provide a custom reason", "error");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const body = {
                reason,
                customReason: reason === "other" ? customReason.trim() : "",
            };

            const res = await fetch(`${API_BASE}/api/products/${id}/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to submit report");

            showToast?.("✅ Report submitted successfully!");
            navigate("/");
        } catch (e2) {
            showToast?.(`❌ ${e2.message || "Report failed"}`, "error");
            setError(e2.message || "Report failed");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="home-wrap">
                <div className="home-loading">Loading product...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-wrap">
                <div className="home-alert">{error}</div>
                <button className="btn-primary" onClick={() => navigate("/")}>
                    Go Back
                </button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="home-wrap">
                <div className="home-empty">Product not found.</div>
                <button className="btn-primary" onClick={() => navigate("/")}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="home-wrap">
            <div className="home-header">
                <h1 className="home-title">Report Product</h1>
                <p className="home-subtitle">
                    Report this product if you believe it violates our policies.
                </p>
            </div>

            <div className="home-product" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <div className="home-product-header">
                    {product.image ? (
                      <img src={`http://localhost:5000${product.image}`} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    ) : (
                      <span className="home-product-emoji">🛒</span>
                    )}
                    <h3 className="home-product-name">{product.name}</h3>
                </div>

                <p className="home-product-desc">{product.description || "No description available."}</p>

                <div className="home-product-footer">
                    <span className="home-product-price">${product.price}</span>
                </div>
            </div>

            <form className="home-form" onSubmit={submitReport} style={{ maxWidth: "600px", margin: "2rem auto" }}>
                <label className="home-form-label">
                    Reason for reporting:
                    <select
                        className="home-input"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    >
                        <option value="">Select a reason</option>
                        <option value="scam">Scam or fraudulent</option>
                        <option value="illegal">Illegal content or activity</option>
                        <option value="inappropriate">Inappropriate content</option>
                        <option value="counterfeit">Counterfeit or fake</option>
                        <option value="other">Other</option>
                    </select>
                </label>

                {reason === "other" && (
                    <label className="home-form-label">
                        Custom reason:
                        <textarea
                            className="home-input"
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder="Please describe the issue..."
                            rows="4"
                            required
                        />
                    </label>
                )}

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => navigate("/")}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button className="btn-danger" type="submit" disabled={submitting}>
                        <FaFlag /> {submitting ? "Submitting..." : "Submit Report"}
                    </button>
                </div>
            </form>
        </div>
    );
}

// src/SellerRequestPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function SellerRequestPage() {
  const navigate = useNavigate();
  const user = readStoredUser();
  const token = getToken();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requestStatus, setRequestStatus] = useState(null); // "pending", "approved", "rejected", or null
  const [hasExistingRequest, setHasExistingRequest] = useState(false);

  function pushToast(detail) {
    window.dispatchEvent(new CustomEvent("toast:push", { detail }));
  }

  // Check if user is already a seller or has existing request
  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    // If already a seller, redirect
    if (user.role === "seller" || user.role === "admin") {
      navigate("/products");
      return;
    }

    checkExistingRequest();
  }, [user, token, navigate]);

  async function checkExistingRequest() {
    try {
      const res = await fetch(`${API_BASE}/api/users/seller-request/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.hasRequest) {
          setHasExistingRequest(true);
          setRequestStatus(data.status);
        }
      }
    } catch (err) {
      console.error("Error checking request status:", err);
    }
  }

  async function handleSubmitRequest() {
    setError("");
    setSuccess("");

    if (!token) {
      setError("You must be logged in");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/users/become-seller`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to submit request");
        pushToast({
          type: "error",
          message: `❌ ${data?.message || "Failed to submit request"}`,
          durationMs: 4000,
        });
        return;
      }

      setSuccess("✅ Your seller request has been submitted!");
      setHasExistingRequest(true);
      setRequestStatus("pending");

      pushToast({
        type: "success",
        message: "📨 Seller request submitted! An admin will review it soon.",
        durationMs: 4000,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/products");
      }, 2000);
    } catch (err) {
      const errMsg = "Network error. Please try again.";
      setError(errMsg);
      pushToast({
        type: "error",
        message: `❌ ${errMsg}`,
        durationMs: 4000,
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!user || !token) {
    return null;
  }

  return (
    <div className="seller-request-page">
      <div className="form-card seller-request-card">
        {!hasExistingRequest ? (
          <>
            <h1>Become a Seller</h1>
            <p className="form-subtitle">
              Join our marketplace and start selling your products to thousands of customers.
            </p>

            <div className="seller-benefits">
              <h3>As a Seller You Can:</h3>
              <ul>
                <li>📦 List unlimited products</li>
                <li>💰 Earn money from sales</li>
                <li>📊 Track your performance</li>
                <li>👥 Reach thousands of buyers</li>
              </ul>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button
                onClick={handleSubmitRequest}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Submitting..." : "Yes, send request"}
              </button>
              <button onClick={() => navigate("/")} className="btn-secondary">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="request-status-container">
              {requestStatus === "pending" && (
                <>
                  <div className="status-icon pending">⏳</div>
                  <h2>Request Pending</h2>
                  <p>Your seller request is under review by our admin team.</p>
                  <p className="status-note">
                    We'll notify you once a decision is made.
                  </p>
                </>
              )}

              {requestStatus === "approved" && (
                <>
                  <div className="status-icon approved">✅</div>
                  <h2>Request Approved!</h2>
                  <p>Congratulations! You're now a seller.</p>
                  <p className="status-note">
                    You can now list products and manage your shop.
                  </p>
                </>
              )}

              {requestStatus === "rejected" && (
                <>
                  <div className="status-icon rejected">❌</div>
                  <h2>Request Rejected</h2>
                  <p>Unfortunately, your request was not approved at this time.</p>
                  <p className="status-note">
                    Please contact support for more information.
                  </p>
                </>
              )}
            </div>

            <button onClick={() => navigate("/products")} className="btn-primary">
              Go to Products
            </button>
          </>
        )}
      </div>
    </div>
  );
}
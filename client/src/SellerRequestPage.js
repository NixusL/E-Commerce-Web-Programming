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

/**
 * Read response body safely:
 * - Reads text once
 * - Parses JSON if possible
 * - Always returns { ok, status, data, rawText }
 */
async function safeReadResponse(res) {
  const status = res.status;
  let rawText = "";
  let data = null;

  try {
    rawText = await res.text(); // read once
  } catch (e) {
    // Extremely rare, but keep it safe
    rawText = "";
  }

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { message: rawText }; // non-json body (html/plain text)
    }
  } else {
    data = {}; // empty body
  }

  return { ok: res.ok, status, data, rawText };
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

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    // If already a seller/admin, redirect
    if (user.role === "seller" || user.role === "admin") {
      navigate("/products");
      return;
    }

    checkExistingRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, navigate]);

  async function checkExistingRequest() {
    try {
      const res = await fetch(`${API_BASE}/api/users/seller-request/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { ok, status, data, rawText } = await safeReadResponse(res);

      if (!ok) {
        console.error("Status check failed:", status, data, rawText);
        // Don't toast here (keeps UI clean), but you can if you want:
        // pushToast({ type: "error", message: `❌ Status check failed (${status})`, durationMs: 3000 });
        return;
      }

      if (data?.hasRequest) {
        setHasExistingRequest(true);
        setRequestStatus(data.status);
      } else {
        setHasExistingRequest(false);
        setRequestStatus(null);
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

      const { ok, status, data, rawText } = await safeReadResponse(res);

      if (!ok) {
        // This will show the REAL backend error (401/404/500 etc)
        const msg =
          data?.message ||
          `Request failed (${status}). Check server console and /api/users routes.`;

        console.error("Become-seller failed:", status, data, rawText);

        setError(msg);
        pushToast({
          type: "error",
          message: `❌ ${msg}`,
          durationMs: 5000,
        });
        return;
      }

      // Success
      setSuccess(data?.message || "✅ Your seller request has been submitted!");
      setHasExistingRequest(true);
      setRequestStatus(data?.status || "pending");

      pushToast({
        type: "success",
        message:
          data?.message ||
          "📨 Seller request submitted! An admin will review it soon.",
        durationMs: 4000,
      });

      // Optional redirect
      setTimeout(() => {
        navigate("/products");
      }, 2000);
    } catch (err) {
      console.error("Become-seller request error:", err);

      // Note: this is a TRUE network error (server down / CORS / connection)
      const errMsg = "Network error (cannot reach backend). Is server running on :5000?";
      setError(errMsg);
      pushToast({
        type: "error",
        message: `❌ ${errMsg}`,
        durationMs: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!user || !token) return null;

  return (
    <div className="seller-request-page">
      <div className="form-card seller-request-card">
        {!hasExistingRequest ? (
          <>
            <h1>Become a Seller</h1>
            <p className="form-subtitle">
              Join our marketplace and start selling your products to thousands
              of customers.
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
            {success && <div className="form-success">{success}</div>}

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
                  <p>
                    Unfortunately, your request was not approved at this time.
                  </p>
                  <p className="status-note">
                    Please contact support for more information.
                  </p>
                </>
              )}

              {!requestStatus && (
                <>
                  <div className="status-icon pending">ℹ️</div>
                  <h2>Status Unknown</h2>
                  <p>
                    We couldn't read your seller request status yet. Try again.
                  </p>
                </>
              )}
            </div>

            <div className="form-actions">
              <button onClick={() => navigate("/products")} className="btn-primary">
                Go to Products
              </button>
              <button onClick={checkExistingRequest} className="btn-secondary">
                Refresh Status
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

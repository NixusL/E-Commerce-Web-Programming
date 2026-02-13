// client/src/SellerRequestPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield, FiBox, FiUsers, FiTrendingUp } from "react-icons/fi";

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

function pushToast(detail) {
  window.dispatchEvent(new CustomEvent("toast:push", { detail }));
}

export default function SellerRequestPage() {
  const navigate = useNavigate();
  const token = getToken();
  const user = readStoredUser();

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) navigate("/login");
    if (user?.role === "seller" || user?.role === "admin") navigate("/");
    
    // Check if seller request has already been sent
    checkSellerRequestStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkSellerRequestStatus() {
    try {
      const res = await fetch(`${API_BASE}/api/users/seller-request/status`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      
      // If user has already sent a request, show success page
      if (data.hasSent || data.status === "pending" || data.status === "approved") {
        setSent(true);
      }
    } catch (e) {
      console.error("Error checking seller request status:", e);
    } finally {
      setLoading(false);
    }
  }

  async function sendRequest() {
    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/users/become-seller`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) throw new Error(data?.message || "Failed to send request");

      pushToast({
        type: "success",
        message: "✅ Seller request sent! An admin will review it soon.",
        canUndo: false,
      });

      // Show on-page success state instead of navigating away
      setSent(true);

    } catch (e) {
      pushToast({
        type: "error",
        message: `❌ ${e.message || "Request failed"}`,
        canUndo: false,
      });
    } finally {
      setSubmitting(false);
    }
  }
  
  // Show loading state while checking status
  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem 1rem",
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.78)", fontSize: "1.1rem" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            width: "min(600px, 100%)",
            borderRadius: "18px",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            background: "rgba(17, 24, 39, 0.94)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            padding: "2.4rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            ✅
          </div>
          <h2
            style={{
              margin: "0 0 0.6rem 0",
              fontSize: "1.6rem",
              color: "rgba(34, 197, 94, 0.95)",
              fontWeight: 900,
            }}
          >
            Request Sent!
          </h2>
          <p
            style={{
              margin: "0 0 1.6rem 0",
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.6,
            }}
          >
            Your seller request has been successfully submitted. An admin will review it and contact you soon.
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/")}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          width: "min(980px, 100%)",
          borderRadius: "18px",

          // ✅ stronger outline
          border: "1px solid rgba(0,0,0,0.12)",

          // ✅ DARKER card surface so text pops (no page background change)
          background: "rgba(17, 24, 39, 0.94)",

          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.6rem 1.6rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                letterSpacing: "0.5px",
                color: "rgba(255,255,255,0.96)",
              }}
            >
              Become a Seller
            </h1>
            <p style={{ margin: "0.4rem 0 0", color: "rgba(255,255,255,0.78)" }}>
              Start listing products and selling to customers on Cyber.
            </p>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0.75rem",
              borderRadius: "999px",

              // ✅ higher-contrast yellow pill
              border: "1px solid rgba(250, 204, 21, 0.55)",
              background: "rgba(250, 204, 21, 0.18)",
              color: "rgba(250, 204, 21, 0.98)",

              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
            title="Seller application"
          >
            <FiShield /> Seller Request
          </div>
        </div>

        {/* Body */}
        <div
          className="seller-req-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "1rem",
            padding: "1.4rem 1.6rem 1.6rem",
          }}
        >
          {/* Left: benefits */}
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "0.85rem",
              }}
            >
              <Feature
                icon={<FiBox />}
                title="List products"
                desc="Create listings, manage stock, and update prices."
              />
              <Feature
                icon={<FiTrendingUp />}
                title="Earn from sales"
                desc="Receive orders and grow your store presence."
              />
              <Feature
                icon={<FiUsers />}
                title="Reach buyers"
                desc="Get exposure to customers browsing the marketplace."
              />
              <Feature
                icon={<FiShield />}
                title="Seller tools"
                desc="Access seller pages: My Products, Refund approvals, etc."
              />
            </div>

            <div
              style={{
                marginTop: "1rem",
                padding: "0.95rem 1rem",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.12)",

                // ✅ darker note block
                background: "rgba(0,0,0,0.35)",

                color: "rgba(255,255,255,0.86)",
                lineHeight: 1.55,
              }}
            >
              <b style={{ color: "rgba(255,255,255,0.98)" }}>Note:</b> Your request
              will be reviewed by an admin. You’ll be upgraded to a seller account
              once approved.
            </div>
          </div>

          {/* Right: action card */}
          <div
            style={{
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.14)",

              // ✅ darker action surface
              background: "rgba(0,0,0,0.40)",

              padding: "1.1rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "rgba(255,255,255,0.96)" }}>
                Submit request
              </div>
              <div style={{ marginTop: "0.4rem", color: "rgba(255,255,255,0.78)" }}>
                Ready to sell? Send a seller request now.
              </div>

              <div
                style={{
                  marginTop: "0.9rem",
                  padding: "0.85rem 0.9rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",

                  // ✅ slightly brighter panel for readability
                  background: "rgba(255,255,255,0.06)",

                  color: "rgba(255,255,255,0.86)",
                  fontSize: "0.95rem",
                }}
              >
                Logged in as:{" "}
                <b style={{ color: "rgba(255,255,255,0.98)" }}>
                  {user?.name || "User"}
                </b>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                type="button"
                className={"btn-secondary" + (submitting ? " btn-disabled" : "")}
                disabled={submitting}
                onClick={sendRequest}
                style={{ flex: 1 }}
              >
                {submitting ? "Sending..." : "Send Request"}
              </button>

              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => navigate(-1)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Responsive */}
        <style>{`
          @media (max-width: 860px) {
            .seller-req-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.14)",

        // ✅ darker feature card
        background: "rgba(0,0,0,0.35)",

        padding: "0.95rem",
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(250, 204, 21, 0.55)",
          background: "rgba(250, 204, 21, 0.16)",
          color: "rgba(250, 204, 21, 0.98)",
          flex: "0 0 auto",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.96)" }}>
          {title}
        </div>
        <div style={{ marginTop: "0.25rem", color: "rgba(255,255,255,0.80)" }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

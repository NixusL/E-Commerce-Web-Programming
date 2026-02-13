import React, { useState, useEffect } from "react";
import { API_BASE, getCurrentUser, pushToast } from "../services/apiClient";

export default function MyProfilePage() {
  const [user, setUser] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [myCoupons, setMyCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingCoupon, setActivatingCoupon] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await getCurrentUser();
        if (!me) {
          window.location.href = "/login";
          return;
        }
        setUser(me);

        // Fetch user's activated coupons
        const res = await fetch(`${API_BASE}/api/coupons/my`, {
          credentials: "include",
        });

        if (res.ok) {
          const coupons = await res.json();
          setMyCoupons(Array.isArray(coupons) ? coupons : []);
        }
      } catch (error) {
        console.error("Load profile error:", error);
        pushToast({
          type: "error",
          message: "❌ Failed to load profile",
          canUndo: false,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleActivateCoupon = async (e) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      pushToast({
        type: "error",
        message: "❌ Please enter a coupon code",
        canUndo: false,
      });
      return;
    }

    setActivatingCoupon(true);

    try {
      const res = await fetch(`${API_BASE}/api/coupons/activate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        pushToast({
          type: "error",
          message: `❌ ${data.message || "Failed to activate coupon"}`,
          canUndo: false,
        });
        return;
      }

      pushToast({
        type: "success",
        message: `✅ Coupon ${couponCode} activated! ${data.coupon.discount}% off`,
        canUndo: false,
      });

      setCouponCode("");
      // Refresh coupons list
      const listRes = await fetch(`${API_BASE}/api/coupons/my`, {
        credentials: "include",
      });
      if (listRes.ok) {
        const coupons = await listRes.json();
        setMyCoupons(Array.isArray(coupons) ? coupons : []);
      }
    } catch (error) {
      console.error("Activate coupon error:", error);
      pushToast({
        type: "error",
        message: "❌ Network error",
        canUndo: false,
      });
    } finally {
      setActivatingCoupon(false);
    }
  };

  if (loading) {
    return <p className="no-products">Loading profile...</p>;
  }

  if (!user) {
    return <p className="no-products">Please log in</p>;
  }

  const totalDiscount = myCoupons.reduce((sum, c) => sum + c.discount, 0);

  return (
    <div className="form-card" style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h1 className="form-title">My Profile</h1>

      <div style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
        <p style={{ margin: "0.5rem 0" }}>
          <strong>Email:</strong> {user.email}
        </p>
        <p style={{ margin: "0.5rem 0" }}>
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>My Coupons</h2>

      <form onSubmit={handleActivateCoupon} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="auth-input"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="auth-primary-button"
            disabled={activatingCoupon}
            style={{ padding: "0.75rem 1.5rem" }}
          >
            {activatingCoupon ? "Activating..." : "Activate"}
          </button>
        </div>
      </form>

      {myCoupons.length > 0 && (
        <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#e8f5e9", borderRadius: "6px", border: "1px solid #4caf50" }}>
          <strong style={{ color: "#2e7d32" }}>
            💰 Total Discount Available: {totalDiscount}%
          </strong>
        </div>
      )}

      {myCoupons.length > 0 ? (
        <div>
          <p style={{ marginBottom: "1rem", color: "#666" }}>
            You have {myCoupons.length} coupon{myCoupons.length !== 1 ? "s" : ""} activated.
          </p>
          <div style={{ display: "grid", gap: "1rem" }}>
            {myCoupons.map((coupon) => (
              <div
                key={coupon._id}
                style={{
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <p style={{ margin: "0.25rem 0", fontSize: "1.1rem", fontWeight: "600" }}>
                      {coupon.code}
                    </p>
                    <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.9rem" }}>
                      {coupon.name}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        margin: "0.25rem 0",
                        fontSize: "1.3rem",
                        fontWeight: "bold",
                        color: "#2e7d32",
                      }}
                    >
                      {coupon.discount}%
                    </p>
                    <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.85rem" }}>
                      off
                    </p>
                  </div>
                </div>
                <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.8rem", color: "#999" }}>
                  Created: {new Date(coupon.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ color: "#999", textAlign: "center", padding: "2rem 0" }}>
          No coupons activated yet. Enter a coupon code above to get started!
        </p>
      )}
    </div>
  );
}

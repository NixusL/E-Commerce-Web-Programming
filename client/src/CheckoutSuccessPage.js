import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      confirmPayment();
    }
  }, [sessionId]);

  async function confirmPayment() {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/orders/confirm-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Payment confirmation failed:", data.message);
        // Still show success page, but log error
      }
    } catch (err) {
      console.error("Network error confirming payment:", err);
    }
  }

  return (
    <div className="checkout-success-page">
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase. Your order has been confirmed.</p>
      <p>You will receive an email confirmation shortly.</p>
      <button className="btn-primary" onClick={() => navigate("/my-orders")}>
        View My Orders
      </button>
      <button className="btn-secondary" onClick={() => navigate("/products")}>
        Continue Shopping
      </button>
    </div>
  );
}

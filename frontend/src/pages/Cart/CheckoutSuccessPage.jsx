import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { API_BASE, getCurrentUser } from "../../services/apiClient";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doCheck = async () => {
      const me = await getCurrentUser();
      if (!me) {
        navigate("/login");
        return;
      }

      try {
        if (sessionId) {
          const res = await fetch(`${API_BASE}/api/orders/confirm-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ sessionId }),
          });

          const data = await res.json().catch(() => ({}));
          if (res.ok && data.order) setLatestOrder(data.order);
        } else {
          const res = await fetch(`${API_BASE}/api/orders/my`, {
            credentials: "include",
          });
          const data = await res.json().catch(() => ([]));
          if (Array.isArray(data) && data.length > 0) setLatestOrder(data[0]);
        }
      } catch (err) {
        console.error("Error during checkout success flow:", err);
      } finally {
        setLoading(false);
      }
    };

    doCheck();
  }, [sessionId, navigate]);


  if (loading) {
    return (
      <div className="checkout-success-page">
        <div className="success-icon">
          <FiCheckCircle size={80} color="#22c55e" />
        </div>
        <h1>Processing Your Order...</h1>
        <p>Please wait while we confirm your payment.</p>
      </div>
    );
  }

  return (
    <div className="checkout-success-page">
      <div className="success-icon">
        <FiCheckCircle size={80} color="#22c55e" />
      </div>
      <h1>Payment Successful!</h1>
      <p className="success-message">
        Thank you for your purchase. Your order has been confirmed and is being processed.
      </p>
      <p className="success-submessage">
        You will receive an email confirmation shortly with your order details.
      </p>

      {latestOrder && latestOrder.items && latestOrder.items.length > 0 && (
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-items-preview">
            {latestOrder.items.map((item, idx) => (
              <div key={idx} className="order-item-preview">
                <div className="item-image">
                  {item.image ? (
                    <img src={`${API_BASE}${item.image}`} alt={item.name} />
                  ) : (
                    <div className="image-placeholder">📦</div>
                  )}
                </div>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">Qty: {item.qty}</span>
                  <span className="item-price">${Number(item.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total: ${Number(latestOrder.total).toFixed(2)}</strong>
          </div>
        </div>
      )}

      <div className="success-actions">
        <button className="btn-primary" onClick={() => navigate("/my-orders")}>
          <FiShoppingBag style={{ marginRight: '8px' }} />
          View My Orders
          <FiArrowRight style={{ marginLeft: '8px' }} />
        </button>
        <button className="btn-secondary" onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

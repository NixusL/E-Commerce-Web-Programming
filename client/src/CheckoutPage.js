import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export default function CheckoutPage({ showToast }) {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404) {
          navigate("/cart");
          return;
        }
        throw new Error("Failed to fetch cart");
      }

      const data = await res.json();
      if (data.items.length === 0) {
        navigate("/cart");
        return;
      }
      setCart(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zip) {
      showToast("❌ Please fill in all required shipping fields");
      return;
    }

    setProcessing(true);

    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/api/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shippingAddress }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast(`❌ ${data.message || "Checkout failed"}`);
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch {
      showToast("❌ Network error during checkout");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <p>Loading checkout...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!cart || cart.items.length === 0) return <p>No items in cart</p>;

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-content">
        <div className="checkout-items">
          <h2>Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.product._id} className="checkout-item">
              <img
                src={`http://localhost:5000${item.product.image}`}
                alt={item.product.name}
                className="checkout-item-image"
              />
              <div className="checkout-item-details">
                <h3>{item.product.name}</h3>
                <p>Quantity: {item.qty}</p>
                <p>{formatPrice(item.product.price)} each</p>
              </div>
              <div className="checkout-item-total">
                {formatPrice(item.product.price * item.qty)}
              </div>
            </div>
          ))}
          <div className="checkout-total">
            <strong>Total: {formatPrice(total)}</strong>
          </div>
        </div>

        <div className="checkout-form">
          <h2>Shipping Address</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="zip">ZIP Code *</label>
              <input
                type="text"
                id="zip"
                value={shippingAddress.zip}
                onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={processing}
            >
              {processing ? "Processing..." : `Pay ${formatPrice(total)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

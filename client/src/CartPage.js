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

export default function CartPage({ showToast }) {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setCart({ items: [] });
          return;
        }
        throw new Error("Failed to fetch cart");
      }

      const data = await res.json();
      setCart(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function updateQty(productId, newQty) {
    if (newQty < 1) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qty: newQty }),
      });

      if (!res.ok) {
        showToast("❌ Failed to update quantity");
        return;
      }

      showToast("✅ Quantity updated");
      fetchCart(); // Refresh cart
    } catch {
      showToast("❌ Network error");
    }
  }

  async function removeItem(productId) {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        showToast("❌ Failed to remove item");
        return;
      }

      showToast("✅ Item removed");
      fetchCart(); // Refresh cart
    } catch {
      showToast("❌ Network error");
    }
  }

  async function clearCart() {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        showToast("❌ Failed to clear cart");
        return;
      }

      showToast("✅ Cart cleared");
      setCart({ items: [] });
    } catch {
      showToast("❌ Network error");
    }
  }

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p>Error: {error}</p>;

  const total = cart?.items?.reduce((sum, item) => sum + item.product.price * item.qty, 0) || 0;

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {cart?.items?.length === 0 ? (
        <p>Your cart is empty. <a href="/products">Shop now</a></p>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.product._id} className="cart-item">
                <img
                  src={`http://localhost:5000${item.product.image}`}
                  alt={item.product.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <p>{formatPrice(item.product.price)}</p>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => updateQty(item.product._id, item.qty - 1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.product._id, item.qty + 1)}>+</button>
                </div>
                <div className="cart-item-total">
                  {formatPrice(item.product.price * item.qty)}
                </div>
                <button
                  className="btn-remove"
                  onClick={() => removeItem(item.product._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <p>Total: {formatPrice(total)}</p>
            <button className="btn-secondary" onClick={clearCart}>
              Clear Cart
            </button>
            <button className="btn-primary" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./cart/CartContext";

const API_BASE = "http://localhost:5000";

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export default function CartPage({ showToast }) {
  const navigate = useNavigate();
  const { items, hydrated, cartTotal, setQty, removeFromCart, clearCart } = useCart();

  if (!hydrated) return <p>Loading cart...</p>;

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {items.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <button className="linklike" onClick={() => navigate("/products")}>
            Shop now
          </button>
        </p>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                <img
                  src={item.image ? `${API_BASE}${item.image}` : ""}
                  alt={item.name}
                  className="cart-item-image"
                />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>{formatPrice(item.price)}</p>
                </div>

                <div className="cart-item-qty">
                  <button
                    onClick={async () => {
                      try {
                        const next = (item.qty || 1) - 1;
                        if (next <= 0) {
                          await removeFromCart(item.productId);
                          showToast?.(`✅ Removed "${item.name}" from cart`);
                          return;
                        }
                        await setQty(item.productId, next);
                      } catch (e) {
                        showToast?.(`❌ ${e.message || "Failed to update quantity"}`, "error");
                      }
                    }}
                  >
                    -
                  </button>

                  <span>{item.qty}</span>

                  <button
                    onClick={async () => {
                      try {
                        await setQty(item.productId, (item.qty || 1) + 1);
                      } catch (e) {
                        showToast?.(`❌ ${e.message || "Failed to update quantity"}`, "error");
                      }
                    }}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  {formatPrice(item.price * item.qty)}
                </div>

                <button
                  className="btn-remove"
                  onClick={async () => {
                    try {
                      await removeFromCart(item.productId);
                      showToast?.(`✅ Removed "${item.name}" from cart`);
                    } catch (e) {
                      showToast?.(`❌ ${e.message || "Failed to remove item"}`, "error");
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <p>Total: {formatPrice(cartTotal)}</p>

            <button
              className="btn-secondary"
              onClick={async () => {
                try {
                  await clearCart();
                  showToast?.("✅ Cart cleared");
                } catch (e) {
                  showToast?.(`❌ ${e.message || "Failed to clear cart"}`, "error");
                }
              }}
            >
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

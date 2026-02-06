import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiX } from "react-icons/fi";
import { useCart } from "./cart/CartContext";

const API_BASE = "http://localhost:5000";

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export default function MiniCart() {
  const navigate = useNavigate();
  const { items, cartCount, cartTotal, removeFromCart, setQty } = useCart();
  const [open, setOpen] = useState(false);

  const topItems = useMemo(() => items.slice(0, 6), [items]);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        className="mini-cart-fab"
        onClick={() => setOpen(true)}
        aria-label="Open mini cart"
        title="Cart"
      >
        <FiShoppingCart className="mini-cart-fab-icon" />
        {cartCount > 0 && <span className="mini-cart-fab-badge">{cartCount}</span>}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="mini-cart-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside className={"mini-cart-drawer" + (open ? " mini-cart-drawer--open" : "")}>
        <div className="mini-cart-header">
          <div className="mini-cart-title">
            <FiShoppingCart /> <span>Your Cart</span>
            <span className="mini-cart-pill">{cartCount}</span>
          </div>

          <button
            type="button"
            className="mini-cart-close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="mini-cart-empty">
            <p>Your cart is empty.</p>
            <button
              className="btn-primary"
              onClick={() => {
                setOpen(false);
                navigate("/products");
              }}
            >
              Shop products
            </button>
          </div>
        ) : (
          <>
            <div className="mini-cart-items">
              {topItems.map((item) => (
                <div key={item.productId} className="mini-cart-item">
                  <div className="mini-cart-thumb">
                    {item.image ? (
                      <img src={`${API_BASE}${item.image}`} alt={item.name} />
                    ) : (
                      <span className="mini-cart-emoji">{item.emoji || "🛒"}</span>
                    )}
                  </div>

                  <div className="mini-cart-item-main">
                    <div className="mini-cart-item-name">{item.name}</div>
                    <div className="mini-cart-item-sub">
                      {formatPrice(item.price)} · Qty {item.qty}
                    </div>

                    <div className="mini-cart-qty">
                      <button
                        onClick={async () => {
                          const next = (item.qty || 1) - 1;
                          if (next <= 0) {
                            await removeFromCart(item.productId);
                            return;
                          }
                          await setQty(item.productId, next);
                        }}
                      >
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => setQty(item.productId, (item.qty || 1) + 1)}>
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="mini-cart-remove"
                    onClick={() => removeFromCart(item.productId)}
                    title="Remove"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}

              {items.length > topItems.length && (
                <div className="mini-cart-more">
                  + {items.length - topItems.length} more item(s)
                </div>
              )}
            </div>

            <div className="mini-cart-footer">
              <div className="mini-cart-total">
                <span>Total</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <div className="mini-cart-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setOpen(false);
                    navigate("/cart");
                  }}
                >
                  View cart
                </button>

                <button
                  className="btn-primary"
                  onClick={() => {
                    setOpen(false);
                    navigate("/checkout");
                  }}
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

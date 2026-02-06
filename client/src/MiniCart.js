import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "./cart/CartContext";

const API_BASE = "http://localhost:5000";

function fmt(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function resolveImgSrc(image) {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  // backend typically stores "/uploads/...."
  return `${API_BASE}${image}`;
}

export default function MiniCart() {
  const navigate = useNavigate();
  const { items, cartCount, cartTotal, addToCart, setQty, removeFromCart } = useCart();

  const [open, setOpen] = useState(false);

  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const count = useMemo(() => Number(cartCount) || 0, [cartCount]);
  const total = useMemo(() => Number(cartTotal) || 0, [cartTotal]);

  return (
    <>
      {/* FAB (HIDES when open) */}
      <button
        type="button"
        className={"mini-cart-fab" + (open ? " mini-cart-fab--hidden" : "")}
        onClick={() => setOpen(true)}
        aria-label="Open mini cart"
        title="Cart"
      >
        <FiShoppingCart className="mini-cart-fab-icon" />
        {count > 0 && <span className="mini-cart-fab-badge">{count}</span>}
      </button>

      {/* Backdrop */}
      {open && <div className="mini-cart-backdrop" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <aside className={"mini-cart-drawer" + (open ? " mini-cart-drawer--open" : "")}>
        <div className="mini-cart-header">
          <div className="mini-cart-title">
            <FiShoppingCart />
            <span>Your Cart</span>
            <span className="mini-cart-pill">{count}</span>
          </div>

          <button
            type="button"
            className="mini-cart-close"
            onClick={() => setOpen(false)}
            aria-label="Close mini cart"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="mini-cart-items">
          {!items?.length ? (
            <div className="mini-cart-empty">Your cart is empty.</div>
          ) : (
            items.map((item) => {
              const id = item.productId; // ✅ your context uses productId
              const imgSrc = resolveImgSrc(item.image);

              return (
                <div className="mini-cart-item" key={id}>
                  <div className="mini-cart-thumb">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="mini-cart-emoji">{item.emoji || "🛒"}</span>
                    )}
                  </div>

                  <div>
                    <div className="mini-cart-item-name">{item.name}</div>
                    <div className="mini-cart-item-sub">
                      {fmt(item.price)} · Qty {item.qty}
                    </div>

                    <div className="mini-cart-qty">
                      <button
                        type="button"
                        onClick={() => setQty(id, Number(item.qty || 0) - 1)}
                        aria-label="Decrease quantity"
                        title="Decrease"
                      >
                        -
                      </button>

                      <span>{item.qty}</span>

                      <button
                        type="button"
                        onClick={() => addToCart({ _id: id }, 1)}
                        aria-label="Increase quantity"
                        title="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mini-cart-remove"
                    onClick={() => removeFromCart(id)}
                    aria-label="Remove item"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="mini-cart-footer">
          <div className="mini-cart-total">
            <span>Total</span>
            <strong>{fmt(total)}</strong>
          </div>

          <div className="mini-cart-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setOpen(false);
                navigate("/cart");
              }}
            >
              View cart
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setOpen(false);
                navigate("/checkout");
              }}
              disabled={!items?.length}
              title={!items?.length ? "Your cart is empty" : "Checkout"}
            >
              Checkout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./cart/CartContext";

const API_BASE = "http://localhost:5000";

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function pushToast(detail) {
  window.dispatchEvent(new CustomEvent("toast:push", { detail }));
}

export default function CartPage() {
  const navigate = useNavigate();
  const { items, hydrated, cartTotal, setQty, removeFromCart, clearCart } =
    useCart();

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
                          // remove with undo
                          const snapshot = { ...item };
                          await removeFromCart(item.productId);

                          pushToast({
                            intent: "cart",
                            type: "success",
                            message: `🗑️ Removed "${item.name}"`,
                            undoLabel: "Undo",
                            canUndo: true,
                            onUndo: () => {
                              // re-add item back (best effort)
                              window.dispatchEvent(
                                new CustomEvent("cart:undo:restore", {
                                  detail: {
                                    items: null,
                                    addOne: {
                                      productId: snapshot.productId,
                                      name: snapshot.name,
                                      price: snapshot.price,
                                      image: snapshot.image,
                                      qty: snapshot.qty || 1,
                                    },
                                  },
                                })
                              );
                            },
                          });

                          return;
                        }

                        await setQty(item.productId, next);
                      } catch (e) {
                        pushToast({
                          type: "error",
                          message: `❌ ${e.message || "Failed to update quantity"}`,
                          canUndo: false,
                        });
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
                        pushToast({
                          type: "error",
                          message: `❌ ${e.message || "Failed to update quantity"}`,
                          canUndo: false,
                        });
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
                      const snapshot = { ...item };
                      await removeFromCart(item.productId);

                      pushToast({
                        intent: "cart",
                        type: "success",
                        message: `🗑️ Removed "${item.name}"`,
                        undoLabel: "Undo",
                        canUndo: true,
                        onUndo: () => {
                          window.dispatchEvent(
                            new CustomEvent("cart:undo:restore", {
                              detail: {
                                items: null,
                                addOne: {
                                  productId: snapshot.productId,
                                  name: snapshot.name,
                                  price: snapshot.price,
                                  image: snapshot.image,
                                  qty: snapshot.qty || 1,
                                },
                              },
                            })
                          );
                        },
                      });
                    } catch (e) {
                      pushToast({
                        type: "error",
                        message: `❌ ${e.message || "Failed to remove item"}`,
                        canUndo: false,
                      });
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
                  const snapshotItems = items.map((x) => ({ ...x }));
                  await clearCart();

                  pushToast({
                    intent: "cart",
                    type: "success",
                    message: "🧹 Cart cleared",
                    undoLabel: "Undo",
                    canUndo: true,
                    onUndo: () => {
                      window.dispatchEvent(
                        new CustomEvent("cart:undo:restore", {
                          detail: { items: snapshotItems },
                        })
                      );
                    },
                  });
                } catch (e) {
                  pushToast({
                    type: "error",
                    message: `❌ ${e.message || "Failed to clear cart"}`,
                    canUndo: false,
                  });
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

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "./cart/CartContext";

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export default function CartPage({ showToast }) {
  const navigate = useNavigate();
  const {
    items,
    cartCount,
    cartTotal,
    setQty,
    removeFromCart,
    clearCart,
    addRawItem,
    replaceCart,
  } = useCart();

  const handleRemove = (item) => {
    try {
      removeFromCart(item.productId);
      showToast?.({
        message: `✅ Removed "${item.name}" from cart`,
        type: "success",
        undoLabel: "Undo",
        undoneMessage: `✅ Undid remove`,
        onUndo: () => addRawItem(item),
      });
    } catch {
      showToast?.({ message: "❌ Failed to remove from cart", type: "error" });
    }
  };

  const handleDecrement = (item) => {
    if (item.qty <= 1) {
      handleRemove(item);
      return;
    }
    try {
      setQty(item.productId, item.qty - 1);
    } catch {
      showToast?.({ message: "❌ Failed to update quantity", type: "error" });
    }
  };

  const handleIncrement = (item) => {
    try {
      setQty(item.productId, item.qty + 1);
    } catch {
      showToast?.({ message: "❌ Failed to update quantity", type: "error" });
    }
  };

  const handleClear = () => {
    const prev = items.map((x) => ({ ...x }));
    try {
      clearCart();
      showToast?.({
        message: "✅ Cart cleared",
        type: "success",
        undoLabel: "Undo",
        undoneMessage: "✅ Undid clear",
        onUndo: () => replaceCart(prev),
      });
    } catch {
      showToast?.({ message: "❌ Failed to clear cart", type: "error" });
    }
  };

  return (
    <div style={{ maxWidth: 950, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ margin: 0 }}>Cart</h1>
        <NavLink to="/products" style={{ textDecoration: "none" }}>
          ← Continue shopping
        </NavLink>
      </div>

      {items.length === 0 ? (
        <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <p style={{ margin: 0 }}>Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            {items.map((it) => (
              <div
                key={it.productId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  padding: 14,
                  border: "1px solid #ddd",
                  borderRadius: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>
                    {it.emoji} {it.name}
                  </div>
                  <div style={{ opacity: 0.8, marginTop: 4 }}>{formatPrice(it.price)}</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                    <button onClick={() => handleDecrement(it)} style={{ padding: "6px 10px" }}>
                      −
                    </button>

                    <input
                      value={it.qty}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isFinite(v)) return;
                        if (v <= 0) {
                          handleRemove(it);
                          return;
                        }
                        setQty(it.productId, v);
                      }}
                      style={{
                        width: 70,
                        padding: 6,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                      }}
                    />

                    <button onClick={() => handleIncrement(it)} style={{ padding: "6px 10px" }}>
                      +
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900 }}>
                    {formatPrice(Number(it.price) * Number(it.qty))}
                  </div>

                  <button
                    onClick={() => handleRemove(it)}
                    style={{ marginTop: 10, padding: "6px 10px" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button onClick={handleClear} style={{ padding: "8px 12px" }}>
              Clear cart
            </button>

            <div style={{ fontSize: 18, fontWeight: 900 }}>
              Items: {cartCount} • Total: {formatPrice(cartTotal)}
            </div>

            <button
              onClick={() => navigate("/checkout")}
              style={{ padding: "10px 14px", fontWeight: 900 }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

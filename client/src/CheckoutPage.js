import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./cart/CartContext";

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function CheckoutPage({ showToast, apiBase }) {
  const navigate = useNavigate();
  const query = useQuery();
  const buyNowId = query.get("buyNow");

  const { items: cartItems, cartTotal, cartCount, clearCart } = useCart();

  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [loadingBuyNow, setLoadingBuyNow] = useState(false);

  // Visual-only inputs
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    async function loadBuyNow() {
      if (!buyNowId) return;
      try {
        setLoadingBuyNow(true);
        const res = await fetch(`${apiBase}/api/products/${buyNowId}`);
        if (!res.ok) throw new Error("Failed to load product");
        const p = await res.json();
        setBuyNowProduct(p);
      } catch {
        showToast?.({ message: "❌ Could not load Buy Now item", type: "error" });
        setBuyNowProduct(null);
      } finally {
        setLoadingBuyNow(false);
      }
    }
    loadBuyNow();
  }, [buyNowId, apiBase, showToast]);

  const checkoutItems = useMemo(() => {
    if (buyNowId) {
      if (!buyNowProduct) return [];
      return [
        {
          productId: buyNowProduct._id,
          name: buyNowProduct.name,
          price: Number(buyNowProduct.price) || 0,
          qty: 1,
          emoji: buyNowProduct.emoji || "🛒",
        },
      ];
    }
    return cartItems;
  }, [buyNowId, buyNowProduct, cartItems]);

  const totals = useMemo(() => {
    const subtotal = checkoutItems.reduce(
      (sum, x) => sum + (Number(x.price) || 0) * (Number(x.qty) || 0),
      0
    );
    const shipping = subtotal > 0 ? 0 : 0; // keep simple
    const tax = 0; // visual-only
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [checkoutItems]);

  const empty =
    checkoutItems.length === 0 && !loadingBuyNow && (!buyNowId || buyNowProduct);

  const handlePlaceOrder = () => {
    // Visual-only: validate minimally
    if (checkoutItems.length === 0) {
      showToast?.({ message: "❌ Nothing to pay for", type: "error" });
      return;
    }
    if (!nameOnCard || !cardNumber || !exp || !cvc) {
      showToast?.({ message: "❌ Please fill card details (visual demo)", type: "error" });
      return;
    }

    showToast?.({ message: "✅ Payment UI complete (no real payment processed)", type: "success" });

    // If this is normal checkout (not buy now), clear cart to simulate purchase
    if (!buyNowId) clearCart();

    // Go somewhere (cart or products)
    navigate("/products");
  };

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ margin: 0 }}>Checkout</h1>
        <NavLink to={buyNowId ? "/products" : "/cart"} style={{ textDecoration: "none" }}>
          ← Back
        </NavLink>
      </div>

      {loadingBuyNow && (
        <div style={{ marginTop: 16, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
          Loading item…
        </div>
      )}

      {empty && (
        <div style={{ marginTop: 16, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
          <p style={{ margin: 0 }}>Nothing to checkout.</p>
          <div style={{ marginTop: 10 }}>
            <NavLink to="/products">Go to products</NavLink>
          </div>
        </div>
      )}

      {!empty && !loadingBuyNow && (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Left: Payment form */}
          <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>Payment details</h2>

            <div style={{ display: "grid", gap: 10 }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Name on card</div>
                <input
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="John Doe"
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                />
              </label>

              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Card number</div>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Expiry</div>
                  <input
                    value={exp}
                    onChange={(e) => setExp(e.target.value)}
                    placeholder="MM/YY"
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                  />
                </label>

                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>CVC</div>
                  <input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                  />
                </label>
              </div>

              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Billing ZIP</div>
                <input
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="10001"
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                />
              </label>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={handlePlaceOrder}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Place Order (Demo)
                </button>

                {!buyNowId && (
                  <div style={{ opacity: 0.75, alignSelf: "center" }}>
                    Cart items: {cartCount} • Cart total: {formatPrice(cartTotal)}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                This is a UI-only checkout. No payment is processed.
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>Order summary</h2>

            <div style={{ display: "grid", gap: 10 }}>
              {checkoutItems.map((it) => (
                <div
                  key={it.productId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    paddingBottom: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>
                    {it.emoji} {it.name}
                    <div style={{ fontWeight: 600, opacity: 0.75, marginTop: 4 }}>
                      Qty: {it.qty}
                    </div>
                  </div>
                  <div style={{ fontWeight: 900 }}>
                    {formatPrice((Number(it.price) || 0) * (Number(it.qty) || 0))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 800 }}>{formatPrice(totals.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 800 }}>{formatPrice(totals.shipping)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Tax</span>
                <span style={{ fontWeight: 800 }}>{formatPrice(totals.tax)}</span>
              </div>

              <div style={{ borderTop: "1px solid #eee", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 900 }}>Total</span>
                <span style={{ fontWeight: 900 }}>{formatPrice(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

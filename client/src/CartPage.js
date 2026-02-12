/* src/CartPage.js */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./cart/CartContext";
import { FiX, FiMinus, FiPlus } from "react-icons/fi";

const API_BASE = "http://localhost:5000";

// Mock Images for the cart items shown in your design if real ones are missing
const MOCK_IMAGES = {
  "iPhone 14 Pro Max": "https://assets.swappie.com/cdn-cgi/image/width=600,height=600,fit=contain,format=auto/swappie-iphone-14-pro-deep-purple-back.png",
  "AirPods Max": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-silver-select-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604021221000",
  "Apple Watch": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-alum-starlight-nc-41-s9_VW_34FR+watch-face-41-starlight-s9_VW_34FR?wid=2000&hei=2000&fmt=png-alpha&.v=1693433582136"
};

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0";
  return `$${n}`;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { items, hydrated, cartTotal, setQty, removeFromCart } = useCart();

  // Calculate estimated values based on design (Tax/Shipping logic usually comes from backend)
  const estimatedTax = 50;
  const estimatedShipping = 29;
  const finalTotal = cartTotal + estimatedTax + estimatedShipping;

  if (!hydrated) return <div style={{padding:'4rem', textAlign:'center'}}>Loading cart...</div>;

  return (
    <div className="cart-page-container">
      <h1 className="cart-page-title">Shopping Cart</h1>

      <div className="cart-layout">
        
        {/* LEFT COLUMN: Cart Items */}
        <div className="cart-items-list">
          {items.length === 0 ? (
            <div style={{textAlign:'center', padding:'2rem', color:'#999'}}>
              Your cart is empty. <br/>
              <button onClick={() => navigate("/products")} style={{marginTop:'1rem', textDecoration:'underline', background:'none', border:'none', cursor:'pointer'}}>Go Shopping</button>
            </div>
          ) : (
            items.map((item) => {
              // Fallback image logic
              let imgSrc = item.image ? `${API_BASE}${item.image}` : "";
              if (!imgSrc) {
                 if (item.name.includes("iPhone")) imgSrc = MOCK_IMAGES["iPhone 14 Pro Max"];
                 else if (item.name.includes("AirPods")) imgSrc = MOCK_IMAGES["AirPods Max"];
                 else if (item.name.includes("Watch")) imgSrc = MOCK_IMAGES["Apple Watch"];
                 else imgSrc = "https://via.placeholder.com/100";
              }

              return (
                <div key={item.productId} className="cart-item-row">
                  <div className="cart-item-image">
                    <img src={imgSrc} alt={item.name} />
                  </div>
                  
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    {/* Fake SKU/ID for design match */}
                    <span className="cart-item-id">#25139526913984</span>
                  </div>

                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => setQty(item.productId, (item.qty || 1) - 1)}>
                      <FiMinus />
                    </button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => setQty(item.productId, (item.qty || 1) + 1)}>
                      <FiPlus />
                    </button>
                  </div>

                  <div className="cart-item-price">
                    {formatPrice(item.price)}
                  </div>

                  <button className="remove-btn" onClick={() => removeFromCart(item.productId)}>
                    <FiX />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="cart-summary-box">
          <h2 className="summary-title">Order Summary</h2>
          
          <div className="promo-code-section">
            <label className="summary-label">Discount code / Promo code</label>
            <input type="text" placeholder="Code" className="promo-input" />
          </div>

          <div className="bonus-card-section">
            <label className="summary-label">Your bonus card number</label>
            <div style={{display:'flex', gap:'10px'}}>
              <input type="text" placeholder="Enter Card Number" className="promo-input" />
              <button className="apply-btn">Apply</button>
            </div>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Estimated Tax</span>
            <strong>{formatPrice(estimatedTax)}</strong>
          </div>
          <div className="summary-row">
            <span>Estimated Shipping & Handling</span>
            <strong>{formatPrice(estimatedShipping)}</strong>
          </div>

          <div className="summary-row total-row">
            <span>Total</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>

          <button className="checkout-btn-full" onClick={() => navigate("/checkout")}>
            Checkout
          </button>
        </div>

      </div>
    </div>
  );
}
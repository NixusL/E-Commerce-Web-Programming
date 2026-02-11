/* src/CheckoutPage.js */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiTruck, FiCreditCard, FiEdit2, FiX, FiPlus, FiChevronDown } from "react-icons/fi";
import { useCart } from "./cart/CartContext";

// Mock Data for "Front-end only" mode
const ADDRESSES = [
  {
    id: "home",
    type: "HOME",
    address: "2118 Thornridge Cir.",
    city: "Syracuse, Connecticut 35624",
    phone: "(209) 555-0104"
  },
  {
    id: "office",
    type: "OFFICE",
    address: "2715 Ash Dr. San Jose",
    city: "South Dakota 83475",
    phone: "(704) 555-0127"
  }
];

// Mock Items for Summary (if cart is empty during dev)
const MOCK_ITEMS = [
  { name: "Apple iPhone 14 Pro Max 128GB", price: 1399, image: "https://assets.swappie.com/cdn-cgi/image/width=600,height=600,fit=contain,format=auto/swappie-iphone-14-pro-max-gold-back.png" },
  { name: "AirPods Max Silver", price: 549, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-silver-select-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604021221000" },
  { name: "Apple Watch Series 9", price: 399, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-alum-starlight-nc-41-s9_VW_34FR+watch-face-41-starlight-s9_VW_34FR?wid=2000&hei=2000&fmt=png-alpha&.v=1693433582136" }
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, cartTotal } = useCart(); // Use real cart if available
  
  // Use MOCK_ITEMS if cart is empty for visualization purposes
  const displayItems = items.length > 0 ? items : MOCK_ITEMS;
  const displayTotal = items.length > 0 ? cartTotal : 2347;

  const [step, setStep] = useState(1); // 1 = Address, 2 = Shipping, 3 = Payment
  const [selectedAddress, setSelectedAddress] = useState("home");
  const [shippingMethod, setShippingMethod] = useState("free");

  // Step 3 Payment Form State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Final Pay Action
      alert("Payment Successful! Redirecting...");
      navigate("/checkout-success");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/cart");
  };

  return (
    <div className="checkout-container">
      
      {/* --- TOP STEPS NAV --- */}
      <div className="steps-nav">
        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
          <div className="step-icon"><FiMapPin /></div>
          <div className="step-label">
            <span className="step-label-small">Step 1</span>
            <span className="step-label-main">Address</span>
          </div>
        </div>
        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
          <div className="step-icon"><FiTruck /></div>
          <div className="step-label">
             <span className="step-label-small">Step 2</span>
             <span className="step-label-main">Shipping</span>
          </div>
        </div>
        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
          <div className="step-icon"><FiCreditCard /></div>
          <div className="step-label">
             <span className="step-label-small">Step 3</span>
             <span className="step-label-main">Payment</span>
          </div>
        </div>
      </div>

      <div className="step-content">
        
        {/* --- STEP 1: ADDRESS --- */}
        {step === 1 && (
          <div className="fade-in">
            <h2 className="section-title">Select Address</h2>
            <div className="address-list">
              {ADDRESSES.map((addr) => (
                <div 
                  key={addr.id} 
                  className={`address-card ${selectedAddress === addr.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(addr.id)}
                >
                  <div className="address-radio">
                    <div className="radio-circle">
                      {selectedAddress === addr.id && <div className="radio-dot" />}
                    </div>
                  </div>
                  <div className="address-details">
                    <div className="address-header">
                       <span className="address-text">{addr.address}</span>
                       <span className="address-type-badge">{addr.type}</span>
                    </div>
                    <p className="address-sub">{addr.city}</p>
                    <p className="address-sub">{addr.phone}</p>
                  </div>
                  <div className="address-actions">
                    <button className="icon-btn-small"><FiEdit2 /></button>
                    <button className="icon-btn-small"><FiX /></button>
                  </div>
                </div>
              ))}
            </div>

            <button className="add-address-btn">
              <FiPlus /> Add New Address
            </button>
          </div>
        )}

        {/* --- STEP 2: SHIPPING --- */}
        {step === 2 && (
          <div className="fade-in">
            <h2 className="section-title">Shipment Method</h2>
            
            <div className="shipment-options">
              <label className={`shipment-card ${shippingMethod === 'free' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="shipping" 
                  checked={shippingMethod === 'free'} 
                  onChange={() => setShippingMethod('free')} 
                />
                <div className="shipment-info">
                  <span className="shipment-price">Free</span>
                  <span className="shipment-desc">Regular shipment</span>
                </div>
                <span className="shipment-date">17 Oct, 2023</span>
              </label>

              <label className={`shipment-card ${shippingMethod === 'express' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="shipping" 
                  checked={shippingMethod === 'express'} 
                  onChange={() => setShippingMethod('express')} 
                />
                <div className="shipment-info">
                  <span className="shipment-price">$8.50</span>
                  <span className="shipment-desc">Get your delivery as soon as possible</span>
                </div>
                <span className="shipment-date">1 Oct, 2023</span>
              </label>

              <label className={`shipment-card ${shippingMethod === 'schedule' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="shipping" 
                  checked={shippingMethod === 'schedule'} 
                  onChange={() => setShippingMethod('schedule')} 
                />
                <div className="shipment-info">
                  <span className="shipment-price">Schedule</span>
                  <span className="shipment-desc">Pick a date when you want to get your delivery</span>
                </div>
                <span className="shipment-date">Select Date <FiChevronDown /></span>
              </label>
            </div>
          </div>
        )}

        {/* --- STEP 3: PAYMENT --- */}
        {step === 3 && (
          <div className="payment-layout fade-in">
            {/* Left: Summary */}
            <div className="payment-summary">
              <h3 className="summary-head">Summary</h3>
              <div className="summary-items">
                {displayItems.map((item, idx) => (
                  <div className="summary-item-row" key={idx}>
                    <div className="s-img"><img src={item.image} alt={item.name} /></div>
                    <div className="s-name">{item.name}</div>
                    <div className="s-price">${item.price}</div>
                  </div>
                ))}
              </div>
              
              <div className="summary-details">
                <div className="sd-row">
                   <span className="sd-label">Address</span>
                   <span className="sd-val">1131 Dusty Townline, Jacksonville, TX 40322</span>
                </div>
                <div className="sd-row">
                   <span className="sd-label">Shipment method</span>
                   <span className="sd-val">Free</span>
                </div>
                
                <div className="sd-row mt-4">
                   <span>Subtotal</span>
                   <span>${displayTotal}</span>
                </div>
                <div className="sd-row">
                   <span>Estimated Tax</span>
                   <span>$50</span>
                </div>
                <div className="sd-row">
                   <span>Estimated Shipping & Handling</span>
                   <span>$29</span>
                </div>
                <div className="sd-row total">
                   <span>Total</span>
                   <span>${displayTotal + 79}</span>
                </div>
              </div>
            </div>

            {/* Right: Payment Form */}
            <div className="payment-form-section">
              <h3 className="summary-head">Payment</h3>
              
              <div className="payment-tabs">
                <button className="p-tab active">Credit Card</button>
                <button className="p-tab">PayPal</button>
                <button className="p-tab">PayPal Credit</button>
              </div>

              <div className="credit-card-visual">
                <div className="cc-chip"></div>
                <div className="cc-number">{cardNumber || "0000 0000 0000 0000"}</div>
                <div className="cc-bottom">
                   <div className="cc-name">{cardName || "CARDHOLDER NAME"}</div>
                   <div className="cc-exp">{expDate || "MM/YY"}</div>
                </div>
                <div className="cc-logo-mastercard"></div>
              </div>

              <div className="p-fields">
                <input 
                  type="text" 
                  placeholder="Cardholder Name" 
                  className="p-input"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Card Number" 
                  className="p-input"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                />
                <div className="p-row">
                  <input 
                    type="text" 
                    placeholder="Exp. Date" 
                    className="p-input"
                    value={expDate}
                    onChange={e => setExpDate(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="CVV" 
                    className="p-input"
                    value={cvv}
                    onChange={e => setCvv(e.target.value)}
                  />
                </div>
                
                <label className="p-checkbox">
                   <input type="checkbox" defaultChecked />
                   <span>Same as billing address</span>
                </label>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- BOTTOM BUTTONS --- */}
      <div className="checkout-actions">
        <button className="btn-back" onClick={handleBack}>
          Back
        </button>
        <button className="btn-next" onClick={handleNext}>
          {step === 3 ? "Pay" : "Next"}
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiTruck, FiCreditCard, FiEdit2, FiX, FiPlus, FiChevronDown } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { API_BASE } from "../../services/apiClient";

// Addresses will be managed dynamically

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
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("free");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  

  // Address Form Modal State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: "HOME",
    address: "",
    city: "",
    phone: ""
  });

  // Step 3 Payment Form State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardNameError, setCardNameError] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [expDateError, setExpDateError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // Fetch addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          return;
        }

        const res = await fetch(`${API_BASE}/api/users/addresses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses);
          if (data.addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(data.addresses[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };

    fetchAddresses();
  }, [selectedAddress]);

  const validateCardName = (name) => {
    if (!name.trim()) return "Cardholder name is required";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Cardholder name must contain only letters and spaces";
    return "";
  };

  const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (!cleaned) return "Card number is required";
    if (!/^\d{13,19}$/.test(cleaned)) return "Card number must be 13-19 digits";
    // Luhn check
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    if (sum % 10 !== 0) return "Invalid card number";
    return "";
  };

  const validateExpDate = (date) => {
    if (!date) return "Expiration date is required";
    if (!/^\d{2}\/\d{2}$/.test(date)) return "Expiration date must be in MM/YY format";
    const [month, year] = date.split('/').map(Number);
    if (month < 1 || month > 12) return "Invalid month";
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return "Expiration date is in the past";
    return "";
  };

  const validateCvv = (cvv) => {
    if (!cvv) return "CVV is required";
    if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3 or 4 digits";
    return "";
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const match = cleaned.match(/\d{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const formatExpDate = (value) => {
    const cleaned = value.replace(/\D+/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleNext = async () => {
    if (step < 3) setStep(step + 1);
    else {
      // Validate payment fields for user feedback (but allow fake data for testing)
      const nameErr = validateCardName(cardName);
      const numberErr = validateCardNumber(cardNumber);
      const expErr = validateExpDate(expDate);
      const cvvErr = validateCvv(cvv);

      setCardNameError(nameErr);
      setCardNumberError(numberErr);
      setExpDateError(expErr);
      setCvvError(cvvErr);

      // For testing, create order using bypass endpoint
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          alert("Please log in to complete purchase");
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_BASE}/api/orders/bypass`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          navigate("/checkout-success");
        } else {
          alert(data.message || "Failed to create order");
        }
      } catch (err) {
        console.error("Order creation failed:", err);
        alert("Network error. Please try again.");
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/cart");
  };

  // Address Management Functions
  const openAddAddress = () => {
    setAddressForm({ type: "HOME", address: "", city: "", phone: "" });
    setEditingId(null);
    setShowAddressForm(true);
  };

  const openEditAddress = (addr) => {
    setAddressForm({ type: addr.type, address: addr.address, city: addr.city, phone: addr.phone });
    setEditingId(addr.id);
    setShowAddressForm(true);
  };

  const deleteAddress = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        alert("Please log in to delete address");
        return;
      }

      const res = await fetch(`${API_BASE}/api/users/addresses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setAddresses(addresses.filter(addr => addr.id !== id));
        if (selectedAddress === id) setSelectedAddress(null);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete address");
      }
    } catch (err) {
      console.error("Delete address failed:", err);
      alert("Network error. Please try again.");
    }
  };

  const saveAddress = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        alert("Please log in to save address");
        return;
      }

      if (editingId) {
        // Update existing address
        const res = await fetch(`${API_BASE}/api/users/addresses/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(addressForm),
        });

        if (res.ok) {
          const data = await res.json();
          setAddresses(addresses.map(addr =>
            addr.id === editingId ? data.address : addr
          ));
        } else {
          const data = await res.json();
          alert(data.message || "Failed to update address");
          return;
        }
      } else {
        // Add new address
        const res = await fetch(`${API_BASE}/api/users/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(addressForm),
        });

        if (res.ok) {
          const data = await res.json();
          setAddresses([...addresses, data.address]);
          if (!selectedAddress) setSelectedAddress(data.address.id);
        } else {
          const data = await res.json();
          alert(data.message || "Failed to add address");
          return;
        }
      }
      setShowAddressForm(false);
     } catch (err) {
      console.error("Save address failed:", err);
      alert("Network error. Please try again.");
    }
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
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
              {addresses.length === 0 ? (
                <p className="no-addresses">No addresses added yet. Add one below.</p>
              ) : (
                addresses.map((addr) => (
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
                      <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); openEditAddress(addr); }}><FiEdit2 /></button>
                      <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}><FiX /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="product-summary">
              <h3>Your Items</h3>
              <div className="summary-items">
                {displayItems.map((item, idx) => (
                  <div className="summary-item-row" key={idx}>
                    <div className="s-img"><img src={item.image ? `${API_BASE}${item.image}` : "/placeholder.png"} alt={item.name} /></div>
                    <div className="s-name">{item.name}</div>
                    <div className="s-price">${item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="add-address-btn" onClick={openAddAddress}>
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
                <span className="shipment-date">17 Oct, 2024</span>
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
                <span className="shipment-date">1 Oct, 2024</span>
              </label>

              <label className={`shipment-card ${shippingMethod === 'schedule' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === 'schedule'}
                  onChange={() => setShippingMethod('schedule')}
                />
                <div className="shipment-info">
                  <span className="shipment-price">$15</span>
                  <span className="shipment-desc">Pick a date and time when you want to get your delivery</span>
                </div>
                <span className="shipment-date">
                  {shippingMethod === 'schedule' ? (
                    <div className="date-time-inputs">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        className="date-input"
                      />
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={e => setScheduledTime(e.target.value)}
                        className="time-input"
                      />
                    </div>
                  ) : (
                    <>Select Date <FiChevronDown /></>
                  )}
                </span>
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
                    <div className="s-img"><img src={item.image ? `${API_BASE}${item.image}` : "/placeholder.png"} alt={item.name} /></div>
                    <div className="s-name">{item.name}</div>
                    <div className="s-price">${item.price}</div>
                  </div>
                ))}
              </div>
              
              <div className="summary-details">
                <div className="sd-row">
                   <span className="sd-label">Address</span>
                   <span className="sd-val">
                     {selectedAddress ? addresses.find(addr => addr.id === selectedAddress)?.address + ", " + addresses.find(addr => addr.id === selectedAddress)?.city : "No address selected"}
                   </span>
                </div>
                <div className="sd-row">
                   <span className="sd-label">Shipment method</span>
                   <span className="sd-val">
                     {shippingMethod === 'free' && 'Free'}
                     {shippingMethod === 'express' && '$8.50'}
                     {shippingMethod === 'schedule' && (scheduledDate && scheduledTime ? `Scheduled for ${scheduledDate} at ${scheduledTime} - $15` : 'Schedule - $15')}
                   </span>
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
                  className={`p-input ${cardNameError ? 'error' : ''}`}
                  value={cardName}
                  onChange={e => {
                    setCardName(e.target.value);
                    setCardNameError(validateCardName(e.target.value));
                  }}
                />
                {cardNameError && <div className="error-message">{cardNameError}</div>}
                <input
                  type="text"
                  placeholder="Card Number"
                  className={`p-input ${cardNumberError ? 'error' : ''}`}
                  value={cardNumber}
                  onChange={e => {
                    const formatted = formatCardNumber(e.target.value);
                    setCardNumber(formatted);
                    setCardNumberError(validateCardNumber(formatted));
                  }}
                />
                {cardNumberError && <div className="error-message">{cardNumberError}</div>}
                <div className="p-row">
                  <input
                    type="text"
                    placeholder="Exp. Date"
                    className={`p-input ${expDateError ? 'error' : ''}`}
                    value={expDate}
                    onChange={e => {
                      const formatted = formatExpDate(e.target.value);
                      setExpDate(formatted);
                      setExpDateError(validateExpDate(formatted));
                    }}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className={`p-input ${cvvError ? 'error' : ''}`}
                    value={cvv}
                    onChange={e => {
                      setCvv(e.target.value);
                      setCvvError(validateCvv(e.target.value));
                    }}
                  />
                </div>
                {expDateError && <div className="error-message">{expDateError}</div>}
                {cvvError && <div className="error-message">{cvvError}</div>}

                <label className="p-checkbox">
                   <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                   <span>Save this card for future purchases</span>
                </label>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- ADDRESS FORM MODAL --- */}
      {showAddressForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
            <div className="modal-body">
              <select
                value={addressForm.type}
                onChange={e => setAddressForm({...addressForm, type: e.target.value})}
                className="modal-input"
              >
                <option value="HOME">HOME</option>
                <option value="OFFICE">OFFICE</option>
              </select>
              <input
                type="text"
                placeholder="Address"
                value={addressForm.address}
                onChange={e => setAddressForm({...addressForm, address: e.target.value})}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="City"
                value={addressForm.city}
                onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="Phone"
                value={addressForm.phone}
                onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={saveAddress}>Save</button>
              <button className="btn-cancel" onClick={cancelAddressForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
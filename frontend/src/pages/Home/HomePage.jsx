import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard";
import Modal from "../../components/Modal";
import { API_BASE } from "../../services/apiClient";



export default function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("New Arrival");

  // State for new arrivals
  const [newArrivals, setNewArrivals] = useState([]);

  // State for modal
  const [showModal, setShowModal] = useState(false);

  // Fetch products on mount and set new arrivals
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        // Take first 8 products as new arrivals
        setNewArrivals(data.slice(0, 8));
      })
      .catch(err => {
        console.error("Error fetching products:", err);
      });
  }, []);

  return (
    <div className="home-page">
      
      {/* --- SECTION 1: iPhone 14 Pro Banner --- */}
      <section className="hero-section">
        <div className="hero-banner-main" style={{backgroundColor: '#211c24'}}>
          <div className="hero-text">
            <h3 className="hero-subtitle">Pro.Beyond.</h3>
            <h1 className="hero-title">IPhone 14 <strong>Pro</strong></h1>
            <p className="hero-desc">Created to change everything for the better. For everyone</p>
            <button className="btn-outline-white" onClick={() => navigate("/products")}>
              Shop Now
            </button>
          </div>
          <div className="hero-image-container">
            <img 
              src="https://assets.swappie.com/cdn-cgi/image/width=600,height=600,fit=contain,format=auto/swappie-iphone-14-pro-deep-purple-back.png" 
              alt="iPhone 14 Pro" 
            />
          </div>
        </div>

        {/* --- SECTION 2: PS5 / MacBook / AirPods Split --- */}
        {/* Simplified version from your previous request, keeping the PS5 focus */}
        <div className="hero-banner-secondary">
          <div className="hero-image-container">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/1/1b/PlayStation_5_and_DualSense_with_transparent_background.png" 
               alt="PlayStation 5" 
               style={{maxHeight: '350px'}}
             />
          </div>
          <div className="hero-text">
            <h1 className="hero-title" style={{fontSize: '3rem'}}>Playstation 5</h1>
            <p className="hero-desc">Incredibly powerful CPUs, GPUs, and an SSD with integrated I/O will redefine your PlayStation experience.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: NEW ARRIVAL GRID (New Code) --- */}
      <section className="new-arrivals-section">
        
        {/* Tabs */}
        <div className="section-tabs">
           <button 
             className={`tab-link ${activeTab === 'New Arrival' ? 'active' : ''}`}
             onClick={() => setActiveTab('New Arrival')}
           >
             New Arrival
           </button>
           <button 
             className={`tab-link ${activeTab === 'Bestseller' ? 'active' : ''}`}
             onClick={() => setActiveTab('Bestseller')}
           >
             Bestseller
           </button>
           <button 
             className={`tab-link ${activeTab === 'Featured' ? 'active' : ''}`}
             onClick={() => setActiveTab('Featured')}
           >
             Featured Products
           </button>
        </div>

        {/* Grid */}
        <div className="new-arrivals-grid">
          {newArrivals.map((product) => (
            <ProductCard key={product.id || product._id} product={product} onBuy={async (p) => { try { await addToCart(p); setShowModal(true); setTimeout(() => setShowModal(false), 3000); } catch (e) {} }} />
          ))}
        </div>

      </section>

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <p>Product added to cart!</p>
        </Modal>
      )}
    </div>
  );
}

/* src/HomePage.js */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiCheck } from "react-icons/fi";
import { useCart } from "./cart/CartContext";

// Data matching the "New Arrival" screenshot
const NEW_ARRIVALS = [
  {
    id: 101,
    name: "Apple iPhone 14 Pro Max 128GB Deep Purple",
    price: 1399,
    image: "https://assets.swappie.com/cdn-cgi/image/width=600,height=600,fit=contain,format=auto/swappie-iphone-14-pro-deep-purple-back.png"
  },
  {
    id: 102,
    name: "Blackmagic Pocket Cinema Camera 6K",
    price: 2535,
    image: "https://images.blackmagicdesign.com/images/products/blackmagicpocketcinemacamera/gallery/pro-evf/high-angle-xl.jpg?_v=1613543887" 
  },
  {
    id: 103,
    name: "Apple Watch Series 9 GPS 41mm Starlight Aluminium",
    price: 399,
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-alum-starlight-nc-41-s9_VW_34FR+watch-face-41-starlight-s9_VW_34FR?wid=2000&hei=2000&fmt=png-alpha&.v=1693433582136"
  },
  {
    id: 104,
    name: "AirPods Max Silver",
    price: 549,
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-silver-select-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604021221000"
  },
  {
    id: 105,
    name: "Samsung Galaxy Watch6 Classic 47mm Black",
    price: 369,
    image: "https://images.samsung.com/is/image/samsung/p6pim/uk/2307/gallery/uk-galaxy-watch6-classic-47mm-sm-r960-sm-r960nzkaeua-537406253?$650_519_PNG$"
  },
  {
    id: 106,
    name: "Galaxy Z Fold5 Unlocked | 256GB | Phantom Black",
    price: 1799,
    image: "https://image-us.samsung.com/us/smartphones/galaxy-z-fold5/gallery/01-Galaxy-Z-Fold5-PhantomBlack-front-open-pen.jpg"
  },
  {
    id: 107,
    name: "Galaxy Buds2 Pro",
    price: 199,
    image: "https://image-us.samsung.com/SamsungUS/home/audio/headphones/galaxy-buds2-pro/gallery/graphite/Galaxy_Buds2_Pro_Graphite_Case_Front_Open_with_Buds.jpg"
  },
  {
    id: 108,
    name: "Apple iPad 9 10.2\" 64GB Wi-Fi Silver (MK2L3) 2021",
    price: 398,
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-2021-hero-silver-wifi-select?wid=940&hei=1112&fmt=png-alpha&.v=1631308880000"
  }
];

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
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // Take first 8 products as new arrivals
        setNewArrivals(data.slice(0, 8));
      })
      .catch(err => {
        console.error('Error fetching products:', err);
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
            <div className="product-card-cyber" key={product.id}>
              <FiHeart className="wishlist-icon" />

              <div className="product-img-box">
                <img src={product.image} alt={product.name} />
              </div>

              <h3 className="product-title" title={product.name}>
                {product.name}
              </h3>

              <div className="product-price">${product.price}</div>

              <button
                className="btn-buy-black"
                onClick={async () => {
                  try {
                    await addToCart(product);
                    setShowModal(true);
                    setTimeout(() => setShowModal(false), 3000);
                  } catch (error) {
                    // Handle error silently or show error modal if needed
                  }
                }}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

      </section>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Product added to cart!</p>
          </div>
        </div>
      )}
    </div>
  );
}

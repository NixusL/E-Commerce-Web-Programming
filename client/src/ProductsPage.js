import React, { useState, useEffect } from "react";
import { useCart } from "./cart/CartContext";
import { FiHeart, FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";

const API_BASE = "http://localhost:5000";

export default function ProductsPage() {
  const { addToCart } = useCart();

  // State for products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for modal
  const [showModal, setShowModal] = useState(false);

  // State for Tabs
  const [activeTab, setActiveTab] = useState("All Products");

  // State for Filters
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [openFilters, setOpenFilters] = useState({
    brand: true,
    memory: false,
    price: false
  });

  // Fetch products on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  // Get unique brands from products
  const brands = [...new Set(products.map(p => p.brand))];

  // Toggle filter function
  const toggleFilter = (filter) => {
    setOpenFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  // Filter Logic
  const filteredProducts = selectedBrand === "All"
    ? products
    : products.filter(p => p.brand === selectedBrand);

  return (
    <div className="products-page-container">

      {/* --- TABS --- */}
      <div className="section-tabs">
        <button
          className={`tab-link ${activeTab === 'All Products' ? 'active' : ''}`}
          onClick={() => setActiveTab('All Products')}
        >
          All Products
        </button>
        <button
          className={`tab-link ${activeTab === 'New Arrivals' ? 'active' : ''}`}
          onClick={() => setActiveTab('New Arrivals')}
        >
          New Arrivals
        </button>
        <button
          className={`tab-link ${activeTab === 'Bestsellers' ? 'active' : ''}`}
          onClick={() => setActiveTab('Bestsellers')}
        >
          Bestsellers
        </button>
      </div>

      <div className="products-page-layout">

        {/* --- SIDEBAR FILTERS --- */}
        <aside className="sidebar">
        {/* Brand Filter */}
        <div className="filter-group">
          <h3 className="filter-title" onClick={() => toggleFilter('brand')}>
            Brand
            {openFilters.brand ? <FiChevronUp className="filter-icon" /> : <FiChevronDown className="filter-icon" />}
          </h3>
          {openFilters.brand && (
            <>
              <div className="filter-option" onClick={() => setSelectedBrand("All")}>
                 <input type="checkbox" checked={selectedBrand === "All"} readOnly />
                 <span>All</span>
              </div>
              {brands.map(brand => (
                <div key={brand} className="filter-option" onClick={() => setSelectedBrand(brand)}>
                   <input type="checkbox" checked={selectedBrand === brand} readOnly />
                   <span>{brand}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Memory Filter */}
        <div className="filter-group">
          <h3 className="filter-title" onClick={() => toggleFilter('memory')}>
            Built-in memory
            {openFilters.memory ? <FiChevronUp className="filter-icon" /> : <FiChevronDown className="filter-icon" />}
          </h3>
          {openFilters.memory && (
            <>
              <div className="filter-option"><input type="checkbox" /> 16GB</div>
              <div className="filter-option"><input type="checkbox" /> 32GB</div>
              <div className="filter-option"><input type="checkbox" /> 64GB</div>
              <div className="filter-option"><input type="checkbox" /> 128GB</div>
              <div className="filter-option"><input type="checkbox" /> 256GB</div>
              <div className="filter-option"><input type="checkbox" /> 512GB</div>
            </>
          )}
        </div>

        {/* Price Filter */}
        <div className="filter-group">
          <h3 className="filter-title" onClick={() => toggleFilter('price')}>
            Price
            {openFilters.price ? <FiChevronUp className="filter-icon" /> : <FiChevronDown className="filter-icon" />}
          </h3>
          {openFilters.price && (
            <div className="filter-option">
              <input
                type="range"
                min="0"
                max="2000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="price-slider"
              />
              <span>From $0 to ${priceRange[1]}</span>
            </div>
          )}
        </div>
      </aside>

      {/* --- MAIN PRODUCT GRID --- */}
      <main className="products-content">
        
        {/* Header: Counts & Sort */}
        <div className="products-header">
          <div>
              Selected Products: <strong>{filteredProducts.length}</strong>
          </div>
          <select style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d2d2d7', color: '#444' }}>
            <option>By rating</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* The Grid */}
        <div className="products-grid fade-in">
          {filteredProducts.map((product) => (
            <div className="product-card-cyber" key={product._id}>

              {/* Wishlist Icon (Top Right) */}
              <FiHeart className="wishlist-icon" size={20} />

              {/* Product Image */}
              <div className="product-img-box">
                <img src={product.image ? `${API_BASE}${product.image}` : "/placeholder.png"} alt={product.name} />
              </div>

              {/* Product Name */}
              <h3 className="product-title">{product.name}</h3>

              {/* Price */}
              <div className="product-price">${product.price}</div>

              {/* Buy Button */}
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



        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <FiCheck size={24} style={{ color: '#4CAF50', marginBottom: '10px' }} />
            <p>Product added to cart!</p>
          </div>
        </div>
      )}
    </div>
  );
}

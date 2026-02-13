import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";
import { API_BASE } from "../../services/apiClient";
import ProductCard from "../../components/ProductCard";
import Modal from "../../components/Modal";

export default function ProductsPage() {
  const { addToCart } = useCart();

  // State for products
  const [products, setProducts] = useState([]);

  // State for modal
  const [showModal, setShowModal] = useState(false);

  // State for Tabs
  const [activeTab, setActiveTab] = useState("All Products");

  // State for Filters
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ brand: 'All', category: '', maxPrice: 2000 });
  const [openFilters, setOpenFilters] = useState({
    brand: true,
    memory: false,
    price: false
  });

  // Fetch products on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
    // fetch categories
    fetch(`${API_BASE}/api/products/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  const [categories, setCategories] = useState([]);

  // Brands available depend on selectedCategory; if none selected, show aggregate of all brands
  const allBrands = Array.from(new Set((categories.flatMap(c => c.brands || [])).map(b => b))).sort((a,b)=>a.toLowerCase().localeCompare(b.toLowerCase()));
  const brands = selectedCategory
    ? (categories.find(c => c.name === selectedCategory)?.brands || [])
    : allBrands;

  // Toggle filter function
  const toggleFilter = (filter) => {
    setOpenFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  // Filter Logic (appliedFilters are applied when user clicks Apply)
  const filteredProducts = products.filter(p => {
    // price
    if (p.price == null) return false;
    if (p.price > appliedFilters.maxPrice) return false;
    // category
    if (appliedFilters.category) {
      const catName = typeof p.category === 'object' && p.category ? p.category.name : p.category;
      if (catName !== appliedFilters.category) return false;
    }
    // brand
    if (appliedFilters.brand && appliedFilters.brand !== 'All') {
      if ((p.brand || '') !== appliedFilters.brand) return false;
    }
    return true;
  });

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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select value={selectedCategory} onChange={(e)=> { setSelectedCategory(e.target.value); setSelectedBrand('All'); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d2d2d7', color: '#444' }}>
                <option value="">All categories</option>
                {categories.map(c=> (<option key={c._id} value={c.name}>{c.name}</option>))}
              </select>
              <select style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d2d2d7', color: '#444' }}>
                <option>By rating</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
        </div>

        {/* Apply Filters button */}
        <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => { setSelectedBrand('All'); setSelectedCategory(''); setPriceRange([0,2000]); setAppliedFilters({ brand: 'All', category: '', maxPrice: 2000 }); }}>
            Reset
          </button>
          <button className="auth-primary-button" onClick={() => setAppliedFilters({ brand: selectedBrand, category: selectedCategory, maxPrice: priceRange[1] })}>
            Apply Filters
          </button>
        </div>

        {/* The Grid */}
        <div className="products-grid fade-in">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={{ ...product, image: product.image ? `${API_BASE}${product.image}` : product.image }} onBuy={async (p) => { try { await addToCart(p); setShowModal(true); setTimeout(() => setShowModal(false), 3000); } catch (e) {} }} />
          ))}
        </div>



        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div style={{ textAlign: 'center' }}>
            <FiCheck size={24} style={{ color: '#4CAF50', marginBottom: '10px' }} />
            <p>Product added to cart!</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import "./App.css";

const CATEGORIES = ["All", "Electronics", "Accessories", "Computers", "Audio"];

function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from your Express + Mongo backend
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">MyShop</div>
        <nav>
          <span className="nav-link active">Products</span>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <div className="hero-text">
            <h1>E-Commerce Website</h1>
            <p>
              Browse our collection of awesome products. This is a demo project
              using React, Express, and MongoDB.
            </p>
          </div>
        </section>

        <section className="categories">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={
                category === selectedCategory
                  ? "category-button category-button--active"
                  : "category-button"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </section>

        <section className="product-grid">
          {loading && <p className="no-products">Loading products...</p>}
          {error && !loading && (
            <p className="no-products">Error: {error}</p>
          )}

          {!loading &&
            !error &&
            filteredProducts.map((product) => (
              <article key={product._id || product.id} className="product-card">
                <div className="product-image placeholder">
                  <span>{product.emoji || "🛒"}</span>
                </div>
                <h2 className="product-name">{product.name}</h2>
                <p className="product-category">{product.category}</p>
                <p className="product-desc">{product.description}</p>
                <p className="product-price">
                  ${Number(product.price).toFixed(2)}
                </p>
                <button className="btn-secondary">Add to Cart</button>
              </article>
            ))}

          {!loading &&
            !error &&
            filteredProducts.length === 0 && (
              <p className="no-products">No products in this category yet.</p>
            )}
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 MyShop · React + Express demo</p>
      </footer>
    </div>
  );
}

export default App;
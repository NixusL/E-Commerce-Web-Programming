import React, { useState } from "react";
import "./App.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 79.99,
    category: "Electronics",
    description: "Comfortable over-ear headphones with noise cancellation.",
    emoji: "🎧",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 129.99,
    category: "Electronics",
    description: "Track your steps, heart rate, and notifications.",
    emoji: "⌚",
  },
  {
    id: 3,
    name: "Gaming Mouse",
    price: 39.99,
    category: "Accessories",
    description: "Ergonomic mouse with customizable RGB lighting.",
    emoji: "🖱️",
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: 89.0,
    category: "Accessories",
    description: "Tactile mechanical keyboard for typing and gaming.",
    emoji: "⌨️",
  },
  {
    id: 5,
    name: "Ultrabook Laptop",
    price: 999.0,
    category: "Computers",
    description: "Lightweight laptop for study and work.",
    emoji: "💻",
  },
  {
    id: 6,
    name: "Portable Speaker",
    price: 49.99,
    category: "Audio",
    description: "Bluetooth speaker with rich sound and deep bass.",
    emoji: "📢",
  },
  {
    id: 7,
    name: "Noise-Cancelling Earbuds",
    price: 59.99,
    category: "Electronics",
    description: "Compact earbuds with active noise cancelling.",
    emoji: "🎶",
  },
  {
    id: 8,
    name: "Gaming Chair",
    price: 199.99,
    category: "Accessories",
    description: "Comfortable chair designed for long gaming sessions.",
    emoji: "🎮",
  },
  {
    id: 9,
    name: "External SSD 1TB",
    price: 149.99,
    category: "Computers",
    description: "Fast external SSD for backups and extra storage.",
    emoji: "💾",
  },
  {
    id: 10,
    name: "Studio Microphone",
    price: 89.99,
    category: "Audio",
    description: "Great for streaming, podcasts, and voice calls.",
    emoji: "🎙️",
  },
];


const CATEGORIES = ["All", "Electronics", "Accessories", "Computers", "Audio"];

function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

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
              Simple React frontend for our Web Programming assignment.
              Browse products and filter them by category.
            </p>
          </div>
        </section>

        <section className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={
                "category-button" +
                (cat === selectedCategory ? " category-button--active" : "")
              }
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </section>

        <section className="product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image placeholder">
                <span>{product.emoji}</span>
              </div>
              <h2 className="product-name">{product.name}</h2>
              <p className="product-category">{product.category}</p>
              <p className="product-desc">{product.description}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <button className="btn-secondary">Add to Cart</button>
            </article>
          ))}

          {filteredProducts.length === 0 && (
            <p className="no-products">No products in this category yet.</p>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2025 MyShop · React + Express demo</p>
      </footer>
    </div>
  );
}

export default App;

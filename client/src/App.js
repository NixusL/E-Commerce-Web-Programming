import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import "./App.css";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

// Static products just for the frontend demo
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
      {/* Top navigation bar */}
      <header className="navbar">
        <NavLink to="/" className="logo">
          MyShop
        </NavLink>

        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              "nav-link nav-link-primary" + (isActive ? " active" : "")
            }
          >
            Sign up
          </NavLink>
        </nav>
      </header>

      <main className="main">
        <Routes>
          {/* Products page */}
          <Route
            path="/"
            element={
              <>
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
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={
                        "category-button" +
                        (selectedCategory === category
                          ? " category-button--active"
                          : "")
                      }
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </section>

                <section className="product-grid">
                  {filteredProducts.length === 0 && (
                    <div className="no-products">
                      No products in this category yet.
                    </div>
                  )}

                  {filteredProducts.map((product) => (
                    <article className="product-card" key={product.id}>
                      <div className="product-image placeholder">
                        <span>{product.emoji}</span>
                      </div>
                      <h2 className="product-name">{product.name}</h2>
                      <p className="product-category">{product.category}</p>
                      <p className="product-desc">{product.description}</p>
                      <p className="product-price">
                        ${product.price.toFixed(2)}
                      </p>
                      <button type="button" className="btn-secondary">
                        Buy Now!
                      </button>
                    </article>
                  ))}
                </section>
              </>
            }
          />

          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      <footer className="footer">
        © 2025 MyShop · React + Express demo
      </footer>
    </div>
  );
}

export default App;

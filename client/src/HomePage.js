import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to TechStore</h1>
          <p>Discover the latest in technology and gadgets. Shop smart, shop TechStore.</p>
          <button className="hero-cta" onClick={() => navigate("/products")}>
            Shop Now
          </button>
        </div>
      </section>

      {/* Additional introductory sections */}
      <section className="intro-section">
        <div className="intro-content">
          <h2>Why Choose TechStore?</h2>
          <p>
            At TechStore, we offer a wide range of high-quality tech products from trusted sellers.
            Whether you're looking for the latest smartphones, laptops, or accessories, we've got you covered.
          </p>
          <div className="intro-images">
            <div className="intro-image">
              <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Smartphone" />
            </div>
            <div className="intro-image">
              <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Laptop" />
            </div>
            <div className="intro-image">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Headphones" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.clientWidth;
      const scrollLeft = carouselRef.current.scrollLeft;

      if (scrollLeft === 0) {
        // At the beginning, scroll to the end
        carouselRef.current.scrollTo({ left: carouselRef.current.scrollWidth, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: -containerWidth, behavior: 'smooth' });
      }
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.clientWidth;
      const scrollLeft = carouselRef.current.scrollLeft;
      const scrollWidth = carouselRef.current.scrollWidth;
      const clientWidth = carouselRef.current.clientWidth;

      if (scrollLeft + clientWidth >= scrollWidth - 1) {
        // At the end, scroll to the beginning
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: containerWidth, behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <section className="hero">
        <div className="carousel-container">
          <button className="carousel-btn carousel-btn-left" onClick={scrollLeft}>
            ‹
          </button>
          <div className="carousel" ref={carouselRef}>
            <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1351&q=80" alt="Tech Background 1" />
            <img src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1351&q=80" alt="Sleek Laptop" />
            <img src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1351&q=80" alt="Latest Smartphone" />
            <img src="https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=1351&q=80" alt="Premium Headphones" />
            <img src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1351&q=80" alt="Gaming Setup" />
          </div>
          <button className="carousel-btn carousel-btn-right" onClick={scrollRight}>
            ›
          </button>
        </div>
        <div className="hero-content">
          <h1>Welcome to TechStore</h1>
          <p>Discover the latest in technology and gadgets. Shop smart, shop TechStore.</p>
          <button className="hero-cta" onClick={() => navigate("/products")}>
            Shop Now
          </button>
        </div>
      </section>

      {/* Tech Showcase Section */}
      <section className="tech-showcase">
        <div className="showcase-container">
          <h2 className="showcase-title">Explore Our Tech World</h2>
          <p className="showcase-subtitle">A glimpse into the innovative gadgets and devices we offer</p>

          <div className="showcase-grid">
            <div className="showcase-item">
              <img src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1351&q=80" alt="Sleek Laptop" />
            </div>
            <div className="showcase-item">
              <img src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1351&q=80" alt="Latest Smartphone" />
            </div>
            <div className="showcase-item">
              <img src="https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=1351&q=80" alt="Premium Headphones" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

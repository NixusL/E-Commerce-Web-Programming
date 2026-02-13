import React from "react";
import { FiHeart } from "react-icons/fi";

export default function ProductCard({ product, onBuy = () => {} }) {
  return (
    <div className="product-card-cyber" data-id={product._id || product.id || product.productId}>
      <FiHeart className="wishlist-icon" />

      <div className="product-img-box">
        <img src={product.image || product.imageUrl || "/placeholder.png"} alt={product.name} />
      </div>

      <h3 className="product-title" title={product.name}>{product.name}</h3>
      <div className="product-price">${product.price}</div>

      <button className="btn-buy-black" onClick={() => onBuy(product)}>
        Buy Now
      </button>
    </div>
  );
}

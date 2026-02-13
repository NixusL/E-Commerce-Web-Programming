import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiSearch, FiHeart, FiShoppingCart, FiUser } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { getCurrentUser, logoutRequest } from "../services/apiClient";

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then(u => { if (mounted) setUser(u); });
    function onAuthChange() { getCurrentUser().then(u => { if (mounted) setUser(u); }); }
    window.addEventListener("authchange", onAuthChange);
    return () => { mounted = false; window.removeEventListener("authchange", onAuthChange); };
  }, []);

  async function logout() {
    await logoutRequest();
    window.dispatchEvent(new Event("authchange"));
    navigate("/login");
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="logo">cyber</NavLink>

      <div className="search-bar-container">
        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '1.2rem' }} />
        <input type="text" placeholder="Search" className="search-input" />
      </div>

      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Products</NavLink>
        {user && (
          <NavLink to="/my-orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>My Orders</NavLink>
        )}
        {user?.role === "admin" && (
          <NavLink to="/admin" className="nav-link" style={{ color: '#facc15' }}>Admin</NavLink>
        )}
        {(user?.role === "seller" || user?.role === "admin") && (
          <NavLink to="/my-products" className="nav-link" style={{ color: '#facc15' }}>My Products</NavLink>
        )}
        {user && user.role !== "seller" && user.role !== "admin" && (
          <NavLink to="/become-seller" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Become a Seller</NavLink>
        )}
        {user?.role === "seller" && (
          <NavLink to="/seller-refunds" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} style={{ color: '#facc15' }}>Refund Requests</NavLink>
        )}
      </nav>

      <div className="nav-icons">
        <button className="icon-btn"><FiHeart /></button>

        <button className="icon-btn" onClick={() => navigate("/cart")}> 
          <FiShoppingCart />
          {cartCount > 0 && <span style={{ fontSize: '0.8rem', marginLeft: '4px', fontWeight: 'bold' }}>({cartCount})</span>}
        </button>

        {user ? (
          <button className="icon-btn" onClick={() => navigate("/my-orders")} title={user.name}><FiUser /></button>
        ) : (
          <button className="icon-btn" onClick={() => navigate("/login")}><FiUser /></button>
        )}

        {user && (
          <button
            type="button"
            onClick={logout}
            className="icon-btn"
            title="Logout"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

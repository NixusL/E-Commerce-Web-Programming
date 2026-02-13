import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiSearch, FiHeart, FiShoppingCart, FiUser } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { getCurrentUser, logoutRequest } from "../services/apiClient";

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then(u => { if (mounted) setUser(u); });
    function onAuthChange() { getCurrentUser().then(u => { if (mounted) setUser(u); }); }
    window.addEventListener("authchange", onAuthChange);
    return () => { mounted = false; window.removeEventListener("authchange", onAuthChange); };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function logout() {
    await logoutRequest();
    setShowProfileMenu(false);
    window.dispatchEvent(new Event("authchange"));
    navigate("/login");
  }

  const handleProfileMenuClick = (path) => {
    navigate(path);
    setShowProfileMenu(false);
  };

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
          <div ref={profileMenuRef} style={{ position: "relative" }}>
            <button 
              className="icon-btn" 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              title={user.name}
            >
              <FiUser />
            </button>
            
            {showProfileMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                  minWidth: "180px",
                  marginTop: "0.5rem",
                }}
              >
                <button
                  onClick={() => handleProfileMenuClick("/my-profile")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    borderBottom: "1px solid #eee",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  👤 My Profile
                </button>
                
                <button
                  onClick={() => handleProfileMenuClick("/my-orders")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    borderBottom: "1px solid #eee",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  📦 My Orders
                </button>

                {(user.role === "seller" || user.role === "admin") && (
                  <button
                    onClick={() => handleProfileMenuClick("/my-products")}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      borderBottom: "1px solid #eee",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    📝 My Products
                  </button>
                )}

                {user.role === "admin" && (
                  <button
                    onClick={() => handleProfileMenuClick("/admin")}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      borderBottom: "1px solid #eee",
                      color: "#facc15",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    ⚙️ Admin Panel
                  </button>
                )}

                <button
                  onClick={logout}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    color: "#e74c3c",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="icon-btn" onClick={() => navigate("/login")}><FiUser /></button>
        )}
      </div>
    </header>
  );
}

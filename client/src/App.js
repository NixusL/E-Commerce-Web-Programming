import React, { useEffect, useRef, useState } from "react";
import "./App.css"; // Ensure this contains the new 'Cyber' CSS
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Pages
import HomePage from "./HomePage";
import ProductsPage from "./ProductsPage"; // This imports your new file
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import MyOrdersPage from "./MyOrdersPage";
import MyProductsPage from "./MyProductsPage";
import AddProductPage from "./AddProductPage";
import EditProductPage from "./EditProductPage";
import AdminPanelPage from "./AdminPanelPage";
import ReportProductPage from "./ReportProductPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import CheckoutSuccessPage from "./CheckoutSuccessPage";
import SellerRequestPage from "./SellerRequestPage";
import SellerRefundsPage from "./SellerRefundsPage";

// Components

// Icons for Cyber Design + Admin
import { FiSearch, FiHeart, FiShoppingCart, FiUser, FiShield, FiBox, FiPlus } from "react-icons/fi";
import { useCart } from "./cart/CartContext";

const API_BASE = "http://localhost:5000";

function readStoredUser() {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

/* ---------------- Toast Item Component (Kept for functionality) ---------------- */
function ToastItem({ toast, onUndo, onClose, onCartToastClick, isCartPage }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onClose(toast.id), 220);
    }, toast.durationMs);
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleCloseClick(e) {
    e.stopPropagation();
    setExiting(true);
    setTimeout(() => onClose(toast.id), 220);
  }

  return (
    <div className={"toast-wrap " + (toast.type === "error" ? "toast--error" : "")}>
      <div className={"toast " + (exiting ? "toast--exit" : "toast--enter")}>
        <span className="toast-msg">{toast.message}</span>
        {toast.undoLabel && toast.canUndo && (
          <button type="button" className="toast-undo" onClick={() => onUndo(toast.id)}>
            {toast.undoLabel}
          </button>
        )}
      </div>
      <button className="toast-close-float" onClick={handleCloseClick}>×</button>
    </div>
  );
}

/* ---------------- MAIN APP COMPONENT ---------------- */
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const [user, setUser] = useState(readStoredUser());
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const pushToast = (t) => {
    const id = `${Date.now()}_${Math.random()}`;
    const toast = {
      id,
      ...t,
      durationMs: t.durationMs || 4500,
    };
    setToasts((prev) => [...prev, toast]);
    return id;
  };

  const closeToast = (id) => setToasts((prev) => prev.filter((x) => x.id !== id));
  const undoToast = (id) => { /* Undo logic placeholder */ };

  // Listen for global toast events
  useEffect(() => {
    function onToastPush(e) { if (e?.detail) pushToast(e.detail); }
    window.addEventListener("toast:push", onToastPush);
    return () => window.removeEventListener("toast:push", onToastPush);
  }, []);

  // Auth Sync
  useEffect(() => {
    function syncAuth() { setUser(readStoredUser()); }
    window.addEventListener("authchange", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("authchange", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("authchange"));
    navigate("/login");
  }

  const showToast = (message) => {
    pushToast({ type: "success", message, canUndo: false });
  };

  return (
    <div className="app">
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="toast-stack">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={closeToast} onUndo={undoToast} />
          ))}
        </div>
      )}

      {/* --- CYBER HEADER --- */}
      <header className="navbar">
        <NavLink to="/" className="logo">cyber</NavLink>

        <div className="search-bar-container">
           <FiSearch style={{position:'absolute', left: '12px', top:'50%', transform:'translateY(-50%)', color:'#999', fontSize: '1.2rem'}} />
           <input type="text" placeholder="Search" className="search-input" />
        </div>

        <nav className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Products</NavLink>

          {/* Admin Link (Only visible to admin) */}
          {user?.role === "admin" && (
            <NavLink to="/admin" className="nav-link" style={{color: '#facc15'}}>Admin</NavLink>
          )}

          {/* My Products Link (Only visible to seller or admin) */}
          {(user?.role === "seller" || user?.role === "admin") && (
            <NavLink to="/my-products" className="nav-link" style={{color: '#facc15'}}>My Products</NavLink>
          )}
        </nav>

        <div className="nav-icons">
           {/* Wishlist (Static for now) */}
           <button className="icon-btn"><FiHeart /></button>
           
           {/* Cart */}
           <button className="icon-btn" onClick={() => navigate("/cart")}>
             <FiShoppingCart />
             {cartCount > 0 && <span style={{fontSize:'0.8rem', marginLeft:'4px', fontWeight: 'bold'}}>({cartCount})</span>}
           </button>
           
           {/* User / Login */}
           {user ? (
             <button className="icon-btn" onClick={() => navigate("/my-orders")} title={user.name}>
               <FiUser />
             </button>
           ) : (
             <button className="icon-btn" onClick={() => navigate("/login")}>
               <FiUser />
             </button>
           )}
           
           {/* Logout Button (Small) */}
           {user && (
             <button 
                onClick={logout} 
                style={{fontSize:'0.8rem', background:'none', border:'1px solid #ddd', borderRadius:'4px', padding:'2px 8px', cursor:'pointer'}}
             >
               Logout
             </button>
           )}
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage showToast={showToast} />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/become-seller" element={<SellerRequestPage />} />
          <Route path="/seller-refunds" element={<SellerRefundsPage />} />

          <Route path="/my-orders" element={<MyOrdersPage showToast={showToast} />} />
          <Route path="/my-products" element={<MyProductsPage />} />

          <Route path="/products/new" element={<AddProductPage />} />
          <Route path="/products/:id/edit" element={<EditProductPage />} />

          <Route path="/report/:id" element={<ReportProductPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
          

        </Routes>
      </main>



      {/* --- CYBER FOOTER --- */}
      <footer className="footer-cyber">
        <div className="footer-content">
           <div className="footer-col">
             <span className="logo footer-logo" style={{color:'white'}}>cyber</span>
             <p className="footer-desc">We are a residential interior design firm located in Portland. Our boutique-studio offers more than</p>
           </div>
           <div className="footer-col">
             <h4>Services</h4>
             <a href="#">Bonus program</a>
             <a href="#">Gift cards</a>
             <a href="#">Credit and payment</a>
             <a href="#">Service contracts</a>
           </div>
           <div className="footer-col">
             <h4>Assistance to the buyer</h4>
             <a href="#">Find an order</a>
             <a href="#">Terms of delivery</a>
             <a href="#">Exchange and return of goods</a>
             <a href="#">Guarantee</a>
           </div>
           <div className="footer-col">
             <h4>Socials</h4>
             <div style={{display:'flex', gap:'1rem'}}>
               <a href="#">Twitter</a>
               <a href="#">Instagram</a>
               <a href="#">Facebook</a>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
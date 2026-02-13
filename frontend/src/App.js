import React, { useEffect, useState } from "react";
import "./styles/App.css";
import "./App.css";
import Navbar from "./components/Navbar";
import {
  Routes,
  Route,
} from "react-router-dom";

// Pages
import HomePage from "./pages/Home/HomePage";
import ProductsPage from "./pages/Products/ProductsPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import MyOrdersPage from "./pages/Orders/MyOrdersPage";
import MyProductsPage from "./pages/Seller/MyProductsPage";
import AddProductPage from "./pages/Seller/AddProductPage";
import EditProductPage from "./pages/Seller/EditProductPage";
import AdminPanelPage from "./pages/Admin/AdminPanelPage";
import ReportProductPage from "./pages/Report/ReportProductPage";
import CartPage from "./pages/Cart/CartPage";
import CheckoutPage from "./pages/Cart/CheckoutPage";
import CheckoutSuccessPage from "./pages/Cart/CheckoutSuccessPage";
import SellerRequestPage from "./pages/Seller/SellerRequestPage";
import SellerRefundsPage from "./pages/Seller/SellerRefundsPage";

// Services
import ToastStack from "./components/ToastStack";
import Footer from "./components/Footer";

// icons removed (moved to Navbar)

/* Toast UI moved to ./components/ToastStack.jsx */

/* ---------------- MAIN APP COMPONENT ---------------- */
export default function App() {
  
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

  const showToast = (message) => {
    pushToast({ type: "success", message, canUndo: false });
  };

  return (
    <div className="app">
      {/* Toast Container */}
      <ToastStack toasts={toasts} onClose={closeToast} onUndo={undoToast} />

      <Navbar />

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



      <Footer />
    </div>
  );
}
// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  // Products
  adminListProducts,
  adminDeleteProductsMany,
  // Orders
  adminListOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  // Users
  adminCreateAdminUser,
  adminCreateSellerUser,
  // Categories
  adminListCategories,
  adminCreateCategory,
  adminDeleteCategory,
  // Reports
  adminListReports,
  adminUpdateReportStatus,
  // Seller Requests
  adminListSellerRequests,
  adminApproveSellerRequest,
  adminRejectSellerRequest,
  adminBackfillSellerRequests,
  // Refunds
  adminListRefunds,
} = require("../controllers/adminController");

router.use(auth, requireAdmin);

/* =============== PRODUCTS =============== */
router.get("/products", adminListProducts);
router.post("/products/delete-many", adminDeleteProductsMany);

/* =============== ORDERS =============== */
router.get("/orders", adminListOrders);
router.put("/orders/:id/status", adminUpdateOrderStatus);
router.delete("/orders/:id", adminDeleteOrder);

/* =============== USERS =============== */
router.post("/users/admin", adminCreateAdminUser);
router.post("/users/seller", adminCreateSellerUser);

/* =============== SELLER ROLE REQUESTS =============== */
router.get("/seller-requests", adminListSellerRequests);
router.post("/seller-requests/:id/approve", adminApproveSellerRequest);
router.post("/seller-requests/:id/reject", adminRejectSellerRequest);
router.post("/seller-requests/backfill", adminBackfillSellerRequests);

/* =============== CATEGORIES =============== */
router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);
router.delete("/categories/:id", adminDeleteCategory);

/* =============== REPORTS =============== */
router.get("/reports", adminListReports);
router.put("/reports/:id/status", adminUpdateReportStatus);

/* =============== REFUNDS =============== */
router.get("/refunds", adminListRefunds);

module.exports = router;
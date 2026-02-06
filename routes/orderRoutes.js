// routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  buyNow,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelMyOrder,
  createCheckoutSession,
  confirmPayment,
  createOrderBypass,

  // refunds
  requestRefund,
  getSellerPendingRefunds,
  sellerApproveRefund,
  processRefund,
} = require("../controllers/orderController");

// ===============================
// CUSTOMER
// ===============================

// Buy / view own orders
router.post("/buy-now", auth, authorize("customer", "admin"), buyNow);
router.get("/my", auth, authorize("customer", "admin"), getMyOrders);

// Cancel own order
router.put("/:id/cancel", auth, authorize("customer", "admin"), cancelMyOrder);

// Request refund (NEW)
router.post(
  "/:id/refund/request",
  auth,
  authorize("customer", "admin"),
  requestRefund
);

// ===============================
// CHECKOUT / PAYMENT
// ===============================

router.post("/checkout", auth, authorize("customer", "admin"), createCheckoutSession);
router.post("/confirm-payment", auth, authorize("customer", "admin"), confirmPayment);
router.post("/bypass", auth, authorize("customer", "admin"), createOrderBypass);

// ===============================
// SELLER
// ===============================

// Seller views pending refund requests for their products
router.get(
  "/refunds/pending",
  auth,
  authorize("seller", "admin"),
  getSellerPendingRefunds
);

// Seller approves refund (NEW)
router.post(
  "/:id/refund/seller-approve",
  auth,
  authorize("seller", "admin"),
  sellerApproveRefund
);

// ===============================
// ADMIN
// ===============================

// Admin processes refund (Stripe) (EXISTING but now gated)
router.post("/:id/refund", auth, authorize("admin"), processRefund);

// Admin order management
router.get("/", auth, authorize("admin"), getAllOrders);
router.put("/:id/status", auth, authorize("admin"), updateOrderStatus);
router.delete("/:id", auth, authorize("admin"), deleteOrder);

module.exports = router;

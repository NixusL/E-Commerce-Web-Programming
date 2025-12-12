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
} = require("../controllers/orderController");

// Customer (and Admin can also buy/view their own orders for simplicity)
router.post("/buy-now", auth, authorize("customer", "admin"), buyNow);
router.get("/my", auth, authorize("customer", "admin"), getMyOrders);

// Cancel own order (customer/admin, but must be their own order)
router.put("/:id/cancel", auth, authorize("customer", "admin"), cancelMyOrder);

// Admin store management
router.get("/", auth, authorize("admin"), getAllOrders);
router.put("/:id/status", auth, authorize("admin"), updateOrderStatus);
router.delete("/:id", auth, authorize("admin"), deleteOrder);

module.exports = router;
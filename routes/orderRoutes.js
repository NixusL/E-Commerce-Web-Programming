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
} = require("../controllers/orderController");

// Customer
router.post("/buy-now", auth, authorize("customer"), buyNow);
router.get("/my", auth, authorize("customer"), getMyOrders);

// Admin
router.get("/", auth, authorize("admin"), getAllOrders);
router.put("/:id/status", auth, authorize("admin"), updateOrderStatus);
router.delete("/:id", auth, authorize("admin"), deleteOrder);

module.exports = router;
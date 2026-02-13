const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  createCoupon,
  activateCoupon,
  getMyCoupons,
  getAllCoupons,
  deactivateCoupon,
} = require("../controllers/couponController");

// User routes
router.post("/activate", auth, activateCoupon); // POST /api/coupons/activate
router.get("/my", auth, getMyCoupons); // GET /api/coupons/my

// Admin routes
router.post("/", requireAdmin, createCoupon); // POST /api/coupons
router.get("/", requireAdmin, getAllCoupons); // GET /api/coupons
router.put("/:id/deactivate", requireAdmin, deactivateCoupon); // PUT /api/coupons/:id/deactivate

module.exports = router;

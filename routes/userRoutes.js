// routes/userRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  requestSellerUpgrade,
  becomeSeller,
  getSellerRequestStatus,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/userController");

// ✅ Keep existing functionality
router.post("/request-seller", auth, requestSellerUpgrade);

// ✅ Add the routes your frontend calls
router.post("/become-seller", auth, becomeSeller);
router.get("/seller-request/status", auth, getSellerRequestStatus);

// Address management routes
router.get("/addresses", auth, getAddresses);
router.post("/addresses", auth, addAddress);
router.put("/addresses/:id", auth, updateAddress);
router.delete("/addresses/:id", auth, deleteAddress);

module.exports = router;

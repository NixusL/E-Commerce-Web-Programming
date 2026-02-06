// routes/userRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  requestSellerUpgrade,
  becomeSeller,
  getSellerRequestStatus,
} = require("../controllers/userController");

// ✅ Keep existing functionality
router.post("/request-seller", auth, requestSellerUpgrade);

// ✅ Add the routes your frontend calls
router.post("/become-seller", auth, becomeSeller);
router.get("/seller-request/status", auth, getSellerRequestStatus);

module.exports = router;

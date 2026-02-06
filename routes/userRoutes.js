// routes/userRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { requestSellerUpgrade } = require("../controllers/userController");

// Customer requests seller role
router.post("/request-seller", auth, requestSellerUpgrade);

module.exports = router;
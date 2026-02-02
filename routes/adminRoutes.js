// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const {
  adminListProducts,
  adminDeleteProductsMany,
  adminListOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  adminCreateAdminUser,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} = require("../controllers/adminController");

router.use(auth, requireAdmin);

// Products
router.get("/products", adminListProducts);
router.post("/products/delete-many", adminDeleteProductsMany);

// Categories
router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);
router.put("/categories/:id", adminUpdateCategory);
router.delete("/categories/:id", adminDeleteCategory);

// Orders
// Orders
router.get("/orders", adminListOrders);
router.put("/orders/:id/status", adminUpdateOrderStatus);
router.delete("/orders/:id", adminDeleteOrder);

// Users
router.post("/users/admin", adminCreateAdminUser);

module.exports = router;
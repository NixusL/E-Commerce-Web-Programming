// routes/productRoutes.js
const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// public read
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// create/update/delete require login
router.post('/', auth, authorize("customer", "admin"), createProduct);
router.put('/:id', auth, authorize("customer", "admin"), updateProduct);
router.delete('/:id', auth, authorize("customer", "admin"), deleteProduct);

module.exports = router;
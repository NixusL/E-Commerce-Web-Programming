// routes/productRoutes.js
const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  getCategories,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload
} = require('../controllers/productController');

// public read
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// create/update/delete require login
router.post('/', auth, authorize("seller", "admin"), upload.single('image'), createProduct);
router.put('/:id', auth, authorize("seller", "admin"), upload.single('image'), updateProduct);
router.delete('/:id', auth, authorize("seller", "admin"), deleteProduct);

module.exports = router;
// routes/productRoutes.js
const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  getCategories,
  getAllProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload
} = require('../controllers/productController');

// public read
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/my', auth, authorize("seller", "admin"), getMyProducts);
router.get('/:id', getProductById);

// create/update/delete require login
router.post('/', auth, authorize("seller", "admin"), (req, res, next) => {
  upload.single('image')(req, res, function(err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createProduct);
router.put('/:id', auth, authorize("seller", "admin"), upload.single('image'), updateProduct);
router.delete('/:id', auth, authorize("seller", "admin"), deleteProduct);

module.exports = router;
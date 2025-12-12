// controllers/productController.js
const Product = require('../models/Product');

// GET /api/products
async function getAllProducts(req, res) {
  try {
    const products = await Product.find(); // fetch all products from MongoDB
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/products/:id
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id); // find product by MongoDB _id

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(400).json({ message: 'Invalid product ID' });
  }
}

// POST /api/products
async function createProduct(req, res) {
  try {
    const { name, price, category, inStock, description, emoji } = req.body;

    // basic validation
    if (!name || price == null) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const product = new Product({
      name,
      price,
      category: category || "Uncategorized",
      description: description || "",
      emoji: emoji || "🛒",
      inStock: inStock ?? true,
    });

    const savedProduct = await product.save(); // save to MongoDB
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/products/:id
async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    // new: true → return updated document
    // runValidators: true → validate fields before update
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: 'Invalid product ID or invalid data' });
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(204).send(); // success, no content
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ message: 'Invalid product ID' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
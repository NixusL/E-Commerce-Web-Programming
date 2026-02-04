// controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require("../models/Order");

// GET /api/products/categories
async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/products
async function getAllProducts(req, res) {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
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
    const product = await Product.findById(id).populate("createdBy", "name email");

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
// customer/admin can create products (sell)
async function createProduct(req, res) {
  try {
    const { name, price, category, inStock, description, emoji } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // Find or create category
    let categoryDoc;
    if (category && category.trim()) {
      categoryDoc = await Category.findOne({ name: category.trim() });
      if (!categoryDoc) {
        categoryDoc = await Category.create({ name: category.trim() });
      }
    } else {
      // Default to 'Uncategorized'
      categoryDoc = await Category.findOne({ name: 'Uncategorized' });
      if (!categoryDoc) {
        categoryDoc = await Category.create({ name: 'Uncategorized' });
      }
    }

    const product = new Product({
      name,
      price: Number(price),
      category: categoryDoc._id,
      description: description || '',
      emoji: emoji || '🛒',
      inStock: inStock ?? true,
      createdBy: req.user?._id, // set ownership
    });

    const savedProduct = await product.save();
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('category', 'name')
      .populate('createdBy', 'name email');
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/products/:id
// admin can update any; customer can update only their own
async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const isAdmin = req.user?.role === "admin";
    const isOwner =
      product.createdBy && req.user?._id && product.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Not allowed to edit this product" });
    }

    // Handle category separately
    if (req.body.category !== undefined) {
      let categoryDoc;
      if (req.body.category && req.body.category.trim()) {
        categoryDoc = await Category.findOne({ name: req.body.category.trim() });
        if (!categoryDoc) {
          categoryDoc = await Category.create({ name: req.body.category.trim() });
        }
      } else {
        // Default to 'Uncategorized'
        categoryDoc = await Category.findOne({ name: 'Uncategorized' });
        if (!categoryDoc) {
          categoryDoc = await Category.create({ name: 'Uncategorized' });
        }
      }
      product.category = categoryDoc._id;
    }

    // Only allow fields you want editable
    const allowedFields = ["name", "price", "description", "emoji", "inStock"];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) product[key] = req.body[key];
    }

    const updated = await product.save();
    const populatedProduct = await Product.findById(updated._id)
      .populate('category', 'name')
      .populate('createdBy', 'name email');
    res.json(populatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: 'Invalid product ID or invalid data' });
  }
}

// DELETE /api/products/:id
// admin can delete any; customer can delete only their own
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const isAdmin = req.user?.role === "admin";
    const isOwner =
      product.createdBy && req.user?._id && product.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Not allowed to delete this product" });
    }

    // block deletion if there are active orders for this product
    const hasActiveOrders = await Order.exists({
      "items.product": id, // assuming orders store items: [{ product, qty, ... }]
      status: { $in: ["pending", "processing"] },
    });

    if (hasActiveOrders) {
      return res.status(409).json({
        message:
          "Cannot delete: there are active orders for this product. Mark out of stock instead.",
      });
    }

    await Product.findByIdAndDelete(id);
    res.status(204).send();

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ message: 'Invalid product ID' });
  }
}

module.exports = {
  getCategories,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

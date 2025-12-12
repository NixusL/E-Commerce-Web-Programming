// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');                 // <-- NEW: for working with file paths
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();         // Load .env
connectDB();             // Connect to MongoDB

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from /public (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// -------- HTML PAGES --------

// Home page -> public/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Products page -> public/products.html
app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

// -------- API ROUTES --------

// Product routes (backend API)
app.use('/api/products', productRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

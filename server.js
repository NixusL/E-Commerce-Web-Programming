// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();         // Load .env
connectDB();             // Connect to MongoDB

const app = express();

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('E-Commerce API is running with MongoDB');
});

// Product routes
app.use('/api/products', productRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
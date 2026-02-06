const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");;
// controller helper for explicit route fallback
const { becomeSeller } = require("./controllers/userController");
const auth = require("./middleware/auth");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Optional: static files (images, etc.)
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple test route (API health)
app.get("/", (req, res) => {
  res.send("E-Commerce API is running");
});

// API routes
app.use("/api/products", productRoutes);
app.use("/api/products", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);;

// Fallback: ensure this endpoint is always handled even if router matching fails
// (Some development setups may route POSTs differently; this guarantees the
// /api/users/become-seller POST is handled by the controller with auth.)
app.post("/api/users/become-seller", auth, becomeSeller);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

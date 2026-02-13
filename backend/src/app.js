const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from root .env or backend/.env
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Database connection
const connectDB = require("./config/db");
connectDB();

// Routes
const productRoutes = require("./routes/productRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");
const { becomeSeller } = require("./controllers/userController");
const auth = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "../../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
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
app.use("/api/users", userRoutes);

// Fallback: ensure this endpoint is always handled even if router matching fails
app.post("/api/users/become-seller", auth, becomeSeller);

module.exports = app;

// config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecommerce";
    const conn = await mongoose.connect(uri, {});

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // stop the app if DB fails
  }
}

module.exports = connectDB;
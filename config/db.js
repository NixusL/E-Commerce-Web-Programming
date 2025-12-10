// config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // these options are usually optional in modern Mongoose,
      // but kept here to be explicit in some setups
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // stop the app if DB fails
  }
}

module.exports = connectDB;
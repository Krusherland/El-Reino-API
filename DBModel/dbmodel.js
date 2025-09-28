const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/netDB");
    console.log("✅ MongoDB connected successfully to database: netDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Don't exit process, let it continue to allow connection retries
  }
};

module.exports = {connection};

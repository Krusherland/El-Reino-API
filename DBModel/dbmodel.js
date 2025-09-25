const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/netDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = {connection};

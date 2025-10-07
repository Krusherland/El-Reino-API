const { Schema, model } = require("mongoose");

const ScrollSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  file: {
    type: String,
    default: null  // Filename of uploaded image
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Scroll", ScrollSchema, "scrolls");

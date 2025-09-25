const { Schema, model } = require("mongoose");

const FollowSchema = Schema({
  user: { type: Schema.ObjectId, ref: "user" },
  followers: { type: Schema.ObjectId, ref: "followers" },
  created_at: { type: Date, default: Date.now },
});

module.exports = model("Follow", FollowSchema, "follows");

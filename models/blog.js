const mongoose = require("mongoose");
const { conn } = require("../config/db");
const Schema = mongoose.Schema;

const blogSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    unique: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["published", "draft"],
    default: "draft",
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});





module.exports = conn.model("Blog", blogSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/db");

const reviewSchema = Schema({
  rating: {
    type: Number,
    default: 0,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
  },
  course: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

module.exports = conn.model("Review", reviewSchema);

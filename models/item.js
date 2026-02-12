// models/item.js
const mongoose = require("mongoose");
const { conn } = require("../config/db");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = conn.models.Item || conn.model("Item", itemSchema);

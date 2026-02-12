// models/Message.js
const mongoose = require("mongoose");
const { conn } = require("../config/db");

const messageSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subjectSpec: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = conn.models.Message || conn.model("Message", messageSchema);

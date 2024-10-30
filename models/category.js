const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/db");

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

module.exports = conn.model("Category", CategorySchema);

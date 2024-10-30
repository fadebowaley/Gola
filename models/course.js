const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/db");

const CourseSchema = new Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Assuming you have a Category model for courses
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String, // Path to course thumbnail image
    required: true,
  },
  content: {
    type: [String], // Array of content strings (e.g., chapter titles or video links)
    required: true,
  },
  prerequisites: {
    type: [String], // Array of prerequisite courses or skills
    required: false,
  },
  duration: {
    type: String, // Duration of the course (e.g., "4 weeks")
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model for instructors
  },
});

module.exports = conn.model("Course", CourseSchema);

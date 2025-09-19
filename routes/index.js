const express = require("express");
const router = express.Router();
const Item = require("../models/item");

// Home route
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.render("pages/index", { items });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// About Me page
router.get("/about", (req, res) => {
  res.render("pages/about");
});

// Learn page (course sales)
router.get("/learn", (req, res) => {
  res.render("pages/learn");
});

// Ask Questions page
router.get("/ask", (req, res) => {
  res.render("pages/ask");
});

module.exports = router;

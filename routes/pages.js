// routes/index.js
const express = require("express");
const router = express.Router();
const Item = require("../models/item"); // Import the Item model

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



module.exports = router;

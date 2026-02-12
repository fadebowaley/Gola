const express = require("express");
const publicController = require("../controllers/public.controller");

const router = express.Router();

router.get("/", publicController.renderHome);
router.get("/about", publicController.renderAbout);
router.get("/ask", publicController.renderAsk);
router.post("/send-message", publicController.submitContactMessage);
router.get("/api/blogs", publicController.getBlogs);

module.exports = router;

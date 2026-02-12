const express = require("express");
const platformController = require("../controllers/platform.controller");
const { isLoggedIn, emailVerified } = require("../middleware/confirm");

const router = express.Router();

router.get("/learn", isLoggedIn, emailVerified, platformController.renderLearn);
router.get("/courses", isLoggedIn, emailVerified, platformController.renderCourses);

module.exports = router;

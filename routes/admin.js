const express = require("express");
const { isLoggedIn, emailVerified } = require("../middleware/confirm");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.get("/", isLoggedIn, emailVerified, adminController.renderAdminHome);

module.exports = router;

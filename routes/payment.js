const express = require("express");
const { isLoggedIn, emailVerified } = require("../middleware/confirm");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

router.get("/enroll/:product", isLoggedIn, emailVerified, paymentController.renderEnroll);

module.exports = router;

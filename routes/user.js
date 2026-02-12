const express = require("express");
const passport = require("passport");
const authController = require("../controllers/auth.controller");
const platformController = require("../controllers/platform.controller");
const sandboxController = require("../controllers/sandbox.controller");
const { isLoggedIn, isNotLoggedIn, emailVerified } = require("../middleware/confirm");

const router = express.Router();

router.get("/login", isNotLoggedIn, authController.renderLogin);
router.post("/login", isNotLoggedIn, authController.loginLocal);

router.get("/register", isNotLoggedIn, authController.renderRegister);
router.post("/register", isNotLoggedIn, authController.registerLocal);

router.get("/verify-email/:token", authController.verifyEmail);

if (passport.GOOGLE_AUTH_ENABLED) {
  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/user/login",
      failureFlash: true,
    }),
    (_req, res) => res.redirect("/user/dashboard")
  );
} else {
  router.get("/auth/google", authController.googleUnavailable);
  router.get("/auth/google/callback", authController.googleUnavailable);
}

router.get("/dashboard", isLoggedIn, emailVerified, platformController.renderDashboard);
router.get("/my-courses", isLoggedIn, emailVerified, platformController.renderMyCourses);
router.get("/assignments", isLoggedIn, emailVerified, platformController.renderAssignments);
router.get("/progress", isLoggedIn, emailVerified, platformController.renderProgress);
router.get("/calendar", isLoggedIn, emailVerified, platformController.renderCalendar);
router.get("/certificates", isLoggedIn, emailVerified, platformController.renderCertificates);
router.get("/billing", isLoggedIn, emailVerified, platformController.renderBilling);
router.get("/lab", isLoggedIn, emailVerified, sandboxController.renderLab);
router.post("/lab/run-code", isLoggedIn, emailVerified, sandboxController.runCode);
router.get("/api-sandbox", isLoggedIn, emailVerified, sandboxController.renderApiSandbox);
router.post(
  "/api-sandbox/request",
  isLoggedIn,
  emailVerified,
  sandboxController.runApiRequest
);
router.get("/logout", isLoggedIn, authController.logout);

module.exports = router;

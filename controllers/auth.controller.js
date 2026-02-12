const passport = require("passport");
const User = require("../models/user");

const renderLogin = (_req, res) => {
  return res.render("pages/login");
};

const renderRegister = (_req, res) => {
  return res.render("pages/register");
};

const registerLocal = (req, res, next) => {
  passport.authenticate("local.signup", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      req.flash("error", info?.message || "Unable to create account.");
      return res.redirect("/user/register");
    }

    req.flash(
      "success",
      "Account created. Please verify your email before logging in."
    );
    return res.redirect("/user/login");
  })(req, res, next);
};

const loginLocal = (req, res, next) => {
  passport.authenticate("local.signin", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      req.flash("error", info?.message || "Login failed.");
      return res.redirect("/user/login");
    }

    return req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      return res.redirect("/user/dashboard");
    });
  })(req, res, next);
};

const logout = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.flash("success", "Logged out successfully.");
    return res.redirect("/");
  });
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      req.flash("error", "Invalid or expired verification token.");
      return res.redirect("/user/login");
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiresAt = undefined;
    await user.save();

    req.flash("success", "Email verified. You can now log in.");
    return res.redirect("/user/login");
  } catch (error) {
    console.error("[auth] verify email failed", error);
    req.flash("error", "Unable to verify email right now.");
    return res.redirect("/user/login");
  }
};

const googleUnavailable = (_req, res) => {
  return res.status(503).send("Google authentication is not configured.");
};

module.exports = {
  renderLogin,
  renderRegister,
  registerLocal,
  loginLocal,
  logout,
  verifyEmail,
  googleUnavailable,
};

const isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/user/dashboard");
};

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  req.flash("error", "Please log in to continue.");
  return res.redirect("/user/login");
};

const emailVerified = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "Please log in to continue.");
    return res.redirect("/user/login");
  }

  if (!req.user.emailVerified) {
    req.flash(
      "error",
      "Please verify your email before accessing platform features."
    );
    return res.redirect("/user/login");
  }

  return next();
};

module.exports = {
  isNotLoggedIn,
  isLoggedIn,
  emailVerified,
};

const User = require("../models/user"); // Adjust the path as necessary

const applyUserLanguage = async (req, res, next) => {
  if (req.user) {
    try {
      const user = await User.findById(req.user._id);
      if (user && user.language) {
        req.i18n.changeLanguage(user.language);
        req.session.lang = user.language; // Ensure session is updated with user language
      }
    } catch (error) {
      console.error("Error applying user language:", error);
    }
  } else if (req.session.lang) {
    req.i18n.changeLanguage(req.session.lang);
  }
  next();
};

module.exports = applyUserLanguage;

const crypto = require("crypto");

function setAvatar(req, res, next) {
  if (req.user) {
    if (req.user.avatar) {
      res.locals.avatarUrl = `/users/${req.user.avatar}`;
    } else {
      const email = req.user.email || "";
      const hash = crypto
        .createHash("md5")
        .update(email.toLowerCase().trim())
        .digest("hex");
      res.locals.avatarUrl = `https://www.gravatar.com/avatar/${hash}?s=200&d=mp`;
    }
  } else {
    res.locals.avatarUrl = null;
  }
  next();
}

module.exports = setAvatar;

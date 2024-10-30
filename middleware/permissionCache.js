const Permission = require("../models/permission");

const loadPermissions = async (req, res, next) => {
  try {
    if (req.user) {
      const permissions = await Permission.find({ roles: req.user.role });
      res.locals.permissions = permissions.map((p) => p.alias);
      //console.log("Permissions loaded successfully.", permissions);
    }
    next();
  } catch (error) {
    console.error("Error loading permissions . . . .", error);
    res.locals.permissions = [];
    next();
  }
};

module.exports = loadPermissions;

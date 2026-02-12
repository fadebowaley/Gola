const ADMIN_ROLES = new Set(["admin", "owner"]);

const renderAdminHome = (req, res) => {
  const role = req.user?.role;

  if (!ADMIN_ROLES.has(role)) {
    return res.status(403).render("pages/admin-forbidden", {
      user: req.user,
      lmsPageTitle: "Restricted Access",
      lmsActive: "dashboard",
    });
  }

  return res.render("pages/admin-dashboard", {
    user: req.user,
    lmsPageTitle: "Admin Command Center",
    lmsActive: "admin",
  });
};

module.exports = {
  renderAdminHome,
};

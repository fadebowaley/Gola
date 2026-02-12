const renderDashboard = (req, res) => {
  return res.render("pages/dashboard", {
    user: req.user,
    lmsPageTitle: "Student Dashboard",
    lmsActive: "dashboard",
  });
};

const renderLearn = (req, res) => {
  return res.render("pages/learn", {
    user: req.user,
    lmsPageTitle: "Learning Path",
    lmsActive: "learn",
  });
};

const renderCourses = (req, res) => {
  return res.render("pages/courses", {
    user: req.user,
    lmsPageTitle: "Course Catalog",
    lmsActive: "courses",
  });
};

const renderMyCourses = (req, res) => {
  return res.render("pages/my-courses", {
    user: req.user,
    lmsPageTitle: "My Courses",
    lmsActive: "my-courses",
  });
};

const renderAssignments = (req, res) => {
  return res.render("pages/assignments", {
    user: req.user,
    lmsPageTitle: "Assignments",
    lmsActive: "assignments",
  });
};

const renderProgress = (req, res) => {
  return res.render("pages/progress", {
    user: req.user,
    lmsPageTitle: "Progress Analytics",
    lmsActive: "progress",
  });
};

const renderCalendar = (req, res) => {
  return res.render("pages/calendar", {
    user: req.user,
    lmsPageTitle: "Learning Calendar",
    lmsActive: "calendar",
  });
};

const renderCertificates = (req, res) => {
  return res.render("pages/certificates", {
    user: req.user,
    lmsPageTitle: "Certificates",
    lmsActive: "certificates",
  });
};

const renderBilling = (req, res) => {
  return res.render("pages/billing", {
    user: req.user,
    lmsPageTitle: "Billing & Plans",
    lmsActive: "billing",
  });
};

module.exports = {
  renderDashboard,
  renderLearn,
  renderCourses,
  renderMyCourses,
  renderAssignments,
  renderProgress,
  renderCalendar,
  renderCertificates,
  renderBilling,
};

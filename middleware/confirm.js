
const Permission = require("../models/permission");
let middlewareObject = {};

//a middleware to check if a user is logged in or not
middlewareObject.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};


//check if user is Login as User 
middlewareObject.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "Get my courses when you loggin");
    res.redirect("/");
  }
};


//check if user email is verified before login
middlewareObject.emailVerified  = (req, res, next) => {
  if (req.isAuthenticated() && !req.user.emailVerified) {
    req.flash("success", "please activate your account by checking email:" + req.user.email);
    //check if user.email not verifies
    return res.redirect("/");
  }
  next();
}



middlewareObject.isSuperUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "owner") {
    return next();
  } else {
    req.flash(
      "error",
      "Access denied. You do not have the required permissions."
    );
    return res.redirect("/error/403"); // or any other page you want to redirect to
  }
};

middlewareObject.hasRolesHospitality = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Please log in to access this page");
    return res.redirect("/user/login");
  }
  const userRole = req.user.role;
  const route = req.route.path;
  const method = req.method;


  try {

    // Check if the route is accessible by the user's role
    const permission = await Permission.findOne({ route });
    if (!permission || !permission.roles.includes(userRole)) {
    return res.status(403).render("error/403");
    }


    // Hotel-based access control
    let courseQuery = {};
    const userCourses = req.user.courses;

    if (userRole === "superUser") {
      req.isSuperUser = true;
      courseQuery = {}; // SuperUser has access to all courses
    } else {
      courseQuery = { _id: { $in: userCourses } }; // Access limited to assigned hotels
    }

    const courses = await User.find(courseQuery)
      .populate("Courses")
      .exec();

    req.filteredCourses = courses;

    next();
  } catch (error) {
    console.error("Error processing permissions or hotel access:", error);
    res.status(500).send("Internal Server Error");
  }
};




module.exports = middlewareObject;



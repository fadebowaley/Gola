const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/user/login");
  }
};

// Middleware to check if user is admin or owner
const requireAdmin = (req, res, next) => {
  if (req.session.user && (req.session.user.role === "admin" || req.session.user.role === "owner")) {
    next();
  } else {
    res.status(403).send("Access denied");
  }
};

// Login page
router.get("/login", (req, res) => {
  res.render("auth/login", { error: null });
});

// Login process
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render("auth/login", { error: "Invalid email or password" });
    }
    
    const isValidPassword = await user.validPassword(password);
    if (!isValidPassword) {
      return res.render("auth/login", { error: "Invalid email or password" });
    }
    
    req.session.user = {
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      avatar: user.getGravatar()
    };
    
    res.redirect("/");
  } catch (error) {
    res.render("auth/login", { error: "Login failed" });
  }
});

// Register page
router.get("/register", (req, res) => {
  res.render("auth/register", { error: null });
});

// Register process
router.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password, role = "student" } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("auth/register", { error: "Email already registered" });
    }
    
    const user = new User({
      firstname,
      lastname,
      email,
      password,
      role
    });
    
    await user.save();
    
    req.session.user = {
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      avatar: user.getGravatar()
    };
    
    res.redirect("/");
  } catch (error) {
    res.render("auth/register", { error: "Registration failed" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Student Dashboard
router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).populate("coursesEnrolled");
    res.render("student/dashboard", { user });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// Profile page
router.get("/profile", requireAuth, (req, res) => {
  res.render("user/profile", { user: req.session.user });
});

module.exports = router;

// Payment routes
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Course enrollment page
router.get("/enroll/:courseId", requireAuth, (req, res) => {
  const courseId = req.params.courseId;
  const courses = {
    'web-dev': { name: 'Complete Web Development Bootcamp', price: 29900 },
    'aws-cloud': { name: 'AWS Cloud Practitioner', price: 19900 },
    'mentorship': { name: '1-on-1 Mentorship Program', price: 15000 }
  };
  
  const course = courses[courseId];
  if (!course) {
    return res.status(404).send('Course not found');
  }
  
  res.render("payment/enroll", { course, courseId });
});

// Process payment
router.post("/payment", requireAuth, async (req, res) => {
  try {
    const { courseId, amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: 'usd',
      metadata: {
        courseId: courseId,
        userId: req.session.user.id
      }
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment success
router.get("/payment/success", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const user = await User.findById(req.session.user.id);
    
    // Add course to user's enrolled courses
    if (!user.coursesEnrolled.includes(courseId)) {
      user.coursesEnrolled.push(courseId);
      await user.save();
    }
    
    res.render("payment/success", { courseId });
  } catch (error) {
    res.status(500).send("Payment processing error");
  }
});


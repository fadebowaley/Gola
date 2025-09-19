const express = require("express");
const router = express.Router();
const User = require("../models/user");
const paystack = require("paystack")(process.env.PAYSTACK_SECRET_KEY);

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/user/login");
  }
};

// Course enrollment page
router.get("/enroll/:courseId", requireAuth, (req, res) => {
  const courseId = req.params.courseId;
  const courses = {
    'web-dev': { 
      name: 'Complete Web Development Bootcamp', 
      price: 29900,
      description: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB'
    },
    'aws-cloud': { 
      name: 'AWS Cloud Practitioner', 
      price: 19900,
      description: 'Learn AWS fundamentals and prepare for certification'
    },
    'mentorship': { 
      name: '1-on-1 Mentorship Program (Monthly)', 
      price: 15000,
      description: 'Weekly 1-on-1 sessions with personalized guidance'
    }
  };
  
  const course = courses[courseId];
  if (!course) {
    return res.status(404).send('Course not found');
  }
  
  res.render("payment/enroll", { 
    course, 
    courseId,
    user: req.session.user,
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY
  });
});

// Initialize payment
router.post("/initialize", requireAuth, async (req, res) => {
  try {
    const { courseId, amount, email } = req.body;
    
    const payment = await paystack.transaction.initialize({
      amount: parseInt(amount),
      email: email,
      currency: 'NGN',
      metadata: {
        courseId: courseId,
        userId: req.session.user.id,
        userName: req.session.user.firstname + ' ' + req.session.user.lastname
      }
    });
    
    res.json({
      success: true,
      authorization_url: payment.data.authorization_url,
      access_code: payment.data.access_code,
      reference: payment.data.reference
    });
  } catch (error) {
    console.error('Paystack error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Verify payment
router.get("/verify/:reference", requireAuth, async (req, res) => {
  try {
    const { reference } = req.params;
    
    const verification = await paystack.transaction.verify(reference);
    
    if (verification.data.status === 'success') {
      const { courseId } = verification.data.metadata;
      const user = await User.findById(req.session.user.id);
      
      // Add course to user's enrolled courses
      if (!user.coursesEnrolled.includes(courseId)) {
        user.coursesEnrolled.push(courseId);
        await user.save();
      }
      
      res.render("payment/success", { 
        courseId,
        reference: verification.data.reference,
        amount: verification.data.amount / 100
      });
    } else {
      res.render("payment/failed", { 
        error: "Payment verification failed" 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.render("payment/failed", { 
      error: "Payment verification failed" 
    });
  }
});

// Payment success page
router.get("/success", requireAuth, (req, res) => {
  res.render("payment/success");
});

// Payment failed page
router.get("/failed", requireAuth, (req, res) => {
  res.render("payment/failed");
});

module.exports = router;

const PRODUCT_CATALOG = {
  "web-dev": {
    title: "Complete Web Development Bootcamp",
    price: "₦299,000",
    duration: "12 weeks",
    level: "Intermediate",
    outcomes: [
      "Build secure API-first applications",
      "Implement auth and production-grade data models",
      "Ship and deploy full-stack projects",
    ],
  },
  "aws-cloud": {
    title: "AWS Cloud Practitioner",
    price: "₦199,000",
    duration: "8 weeks",
    level: "Beginner to Intermediate",
    outcomes: [
      "Understand AWS core services and pricing",
      "Design baseline secure cloud workloads",
      "Prepare for practitioner-level certification",
    ],
  },
  mentorship: {
    title: "Mentorship Sprint",
    price: "₦150,000 / month",
    duration: "Monthly",
    level: "Custom",
    outcomes: [
      "Weekly architecture and code review sessions",
      "Personalized roadmap and implementation goals",
      "Direct feedback on real product work",
    ],
  },
};

const toTitle = (slug) =>
  String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const renderEnroll = (req, res) => {
  const { product } = req.params;
  const normalized = String(product || "").trim().toLowerCase();
  const config =
    PRODUCT_CATALOG[normalized] ||
    {
      title: toTitle(normalized) || "Course Enrollment",
      price: "To be confirmed",
      duration: "TBD",
      level: "TBD",
      outcomes: [
        "Enrollment route is active",
        "Payment checkout wiring is in progress",
        "Support is available from the Ask page",
      ],
    };

  return res.render("pages/payment-enroll", {
    user: req.user,
    productSlug: normalized,
    product: config,
    lmsPageTitle: "Enrollment Checkout",
    lmsActive: "billing",
  });
};

module.exports = {
  renderEnroll,
};

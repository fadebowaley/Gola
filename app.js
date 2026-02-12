const path = require("path");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const passport = require("./config/passport");
const indexRoutes = require("./routes/index");
const userRoutes = require("./routes/user");
const pagesRoutes = require("./routes/pages");
const adminRoutes = require("./routes/admin");
const blogRoutes = require("./routes/blog");
const paymentRoutes = require("./routes/payment");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required to start the application.");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required to start the application.");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.googleAuthEnabled = passport.GOOGLE_AUTH_ENABLED;
  next();
});

app.use("/", indexRoutes);
app.use("/", pagesRoutes);
app.use("/pages", pagesRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/blog", blogRoutes);
app.use("/payment", paymentRoutes);

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.use((error, _req, res, _next) => {
  console.error("[error]", error);
  res.status(500).send("Internal Server Error");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

// app.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const indexRoutes = require("./routes/index");
const usersRoutes = require("./routes/user");
const pagesRoutes = require("./routes/pages");
const adminRoutes = require("./routes/admin");
const blogRoutes = require("./routes/blog");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", indexRoutes);
//Use Routes and API Config
app.use("/user", usersRoutes);
app.use("/pages", pagesRoutes);
app.use("/admin", adminRoutes);
app.use("/blog", blogRoutes);


// Start the server
app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

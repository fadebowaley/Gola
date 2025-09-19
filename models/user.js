const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Schema = mongoose.Schema;
const { conn } = require("../config/db");
const saltRounds = 10;

const userSchema = Schema({
  earlyRelease: {
    type: Boolean,
    default: true,
  },
  communication: {
    type: Boolean,
    default: true,
  },
  language: { type: String, default: "en" },
  timeZone: { type: String, default: "UTC" },
  notifications: { type: Boolean, default: true },
  deleteStatus: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: false,
  },
  title: {
    type: String,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  role: {
    type: String,
    enum: ["subscriber", "student", "admin", "owner"],
    default: "subscriber",
  },
  password: {
    type: String,
    required: function () {
      return this.role === "student"; // Only required for students
    },
  },
  resetPasswordToken: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationTokenExpiresAt: {
    type: Date,
  },
  emailVerifiedAt: {
    type: Date,
  },
  resetPasswordExpires: {
    type: Date,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  username: {
    type: String,
    default: function () {
      return `${this.firstname.toLowerCase()}${this.lastname.toLowerCase()}${Math.floor(
        Math.random() * 10000
      )}`;
    },
  },

  subscribedAt: {
    // Track subscription date
    type: Date,
    default: function () {
      return this.role === "subscriber" ? Date.now() : null; // Only set for subscribers
    },
  },
  coursesEnrolled: [
    {
      // List of courses enrolled for students
      type: Schema.Types.ObjectId,
      ref: "Course", // Reference to the Course model
    },
  ],
});

// Pre-save hook to hash the password before saving
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

// Method to check if password is valid
userSchema.methods.validPassword = async function (password) {
  try {
    const match = await bcrypt.compare(password, this.password);
    return match;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Method to get the Gravatar URL
userSchema.methods.getGravatar = function (size = 200) {
  const email = this.email || "";
  const hash = crypto
    .createHash("md5")
    .update(email.toLowerCase().trim())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`; // You can change 'identicon' to another default image option
};

module.exports = conn.model("User", userSchema);

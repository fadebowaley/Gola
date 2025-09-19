const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const Permission = require("../models/permission");

// function to generate Token
function generateToken() {
  return require("crypto").randomBytes(20).toString("hex");
}

const { sendVerificationEmailInBackground } = require("../worker/workers");

//send a verification email
async function sendVerificationEmail(email) {
  // Check if the user exists in the database
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User does not exist");
  }

  // Generate a new token and save it to the user's record in the database
  const token = generateToken();
  user.emailVerificationToken = token;
  user.emailVerificationTokenExpiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ); // Token expires in 24 hours
  await user.save();

  // Send the verification email to the user
  await sendVerificationEmailInBackground(token, email, user.firstname);
}

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize user by storing user ID in the session
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Retrieve user by ID
    done(null, user); // Pass user to the next middleware
  } catch (err) {
    done(err, null); // Handle errors
  }
});

// Passport middleware
passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const { title, firstname, lastname, phone } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return done(null, false, { message: "Email already exists" });
        }
        const user = new User({
          title,
          firstname,
          lastname,
          email,
          phone,
          password,
          avatar: new User().getGravatar(),
        });
        await user.save();
        //send verification email
        sendVerificationEmail(user.email);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "identifier",
      passwordField: "password",
      passReqToCallback: true, // Ensure req is passed
    },
    async (req, identifier, password, done) => {
      // Correct order with req as the first parameter
      try {
        const user = await User.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
          return done(null, false, { message: "Invalid email or username" });
        }

        const isMatch = await user.validPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;

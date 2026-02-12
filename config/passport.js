const crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const { sendVerificationEmailInBackground } = require("../worker/workers");

const GOOGLE_AUTH_ENABLED = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

async function issueEmailVerification(user) {
  const token = generateToken();
  user.emailVerificationToken = token;
  user.emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const appBaseUrl =
    process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  // Keep a local fallback path while email templates/providers are still being completed.
  console.info(
    `[auth] email verification link for ${user.email}: ${appBaseUrl}/user/verify-email/${token}`
  );

  try {
    await sendVerificationEmailInBackground(token, user.email, user.firstname || "User");
  } catch (error) {
    console.error("[auth] failed to queue verification email", error);
  }
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

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
        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
          return done(null, false, { message: "Email already exists." });
        }

        const firstname = String(req.body.firstname || "").trim();
        const lastname = String(req.body.lastname || "").trim();
        const phone = String(req.body.phone || "").trim();
        const title = String(req.body.title || "").trim();

        const user = new User({
          title,
          firstname,
          lastname,
          phone,
          email: normalizedEmail,
          password,
          role: "student",
          authProvider: "local",
          emailVerified: false,
        });

        user.avatar = user.getGravatar();
        await user.save();
        await issueEmailVerification(user);

        return done(null, user);
      } catch (error) {
        return done(error);
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
      passReqToCallback: true,
    },
    async (req, identifier, password, done) => {
      try {
        const normalized = String(identifier).trim().toLowerCase();
        const user = await User.findOne({
          $or: [{ email: normalized }, { username: identifier }],
        });

        if (!user) {
          return done(null, false, { message: "Invalid email/username or password." });
        }

        if (!user.password) {
          return done(null, false, {
            message: "This account uses social login. Please continue with Google.",
          });
        }

        const isMatch = await user.validPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email/username or password." });
        }

        if (!user.emailVerified) {
          return done(null, false, {
            message: "Please verify your email before accessing the platform.",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

if (GOOGLE_AUTH_ENABLED) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/user/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile?.emails?.[0]?.value?.toLowerCase() ||
            `${profile.id}@google.local`;
          const googleEmailVerified = Boolean(
            profile?.emails?.[0]?.verified || profile?._json?.email_verified
          );

          if (!googleEmailVerified) {
            return done(null, false, {
              message: "Google account email is not verified.",
            });
          }

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (!user) {
            const firstName = profile?.name?.givenName || "Google";
            const lastName = profile?.name?.familyName || "User";

            user = new User({
              firstname: firstName,
              lastname: lastName,
              email,
              role: "subscriber",
              authProvider: "google",
              googleId: profile.id,
              emailVerified: true,
              emailVerifiedAt: new Date(),
            });
            user.avatar = profile?.photos?.[0]?.value || user.getGravatar();
            await user.save();
          } else {
            let changed = false;
            if (!user.googleId) {
              user.googleId = profile.id;
              changed = true;
            }
            if (!user.emailVerified) {
              user.emailVerified = true;
              user.emailVerifiedAt = new Date();
              changed = true;
            }
            if (changed) {
              await user.save();
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

passport.issueEmailVerification = issueEmailVerification;
passport.GOOGLE_AUTH_ENABLED = GOOGLE_AUTH_ENABLED;

module.exports = passport;

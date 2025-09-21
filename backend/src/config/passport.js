const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const { PrismaClient } = require("@prisma/client");
const config = require("../config");

const prisma = new PrismaClient();

// Google OAuth Strategy
if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: `${config.baseUrl}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with Google ID
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with same email
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.emails[0].value },
          });

          if (existingUser) {
            // Link Google account to existing user
            user = await prisma.user.update({
              where: { id: existingUser.id },
              data: { googleId: profile.id },
            });
            return done(null, user);
          }

          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              name: profile.displayName,
              avatar: profile.photos[0]?.value,
              googleId: profile.id,
              role: "USER",
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (config.facebook.appId && config.facebook.appSecret) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.facebook.appId,
        clientSecret: config.facebook.appSecret,
        callbackURL: `${config.baseUrl}/api/auth/facebook/callback`,
        profileFields: ["id", "emails", "name", "picture.type(large)"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with Facebook ID
          let user = await prisma.user.findUnique({
            where: { facebookId: profile.id },
          });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with same email
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;
          if (email) {
            const existingUser = await prisma.user.findUnique({
              where: { email },
            });

            if (existingUser) {
              // Link Facebook account to existing user
              user = await prisma.user.update({
                where: { id: existingUser.id },
                data: { facebookId: profile.id },
              });
              return done(null, user);
            }
          }

          // Create new user
          user = await prisma.user.create({
            data: {
              email: email || `facebook_${profile.id}@webtruyen.com`,
              name: `${profile.name.givenName} ${profile.name.familyName}`,
              avatar: profile.photos[0]?.value,
              facebookId: profile.id,
              role: "USER",
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

const express = require("express");
const passport = require("../config/passport");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Traditional auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Protected route to get current user
router.get("/me", authenticateToken, authController.me);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/failure",
    session: false,
  }),
  authController.oauthSuccess
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/api/auth/failure",
    session: false,
  }),
  authController.oauthSuccess
);

// OAuth failure route
router.get("/failure", authController.oauthFailure);

module.exports = router;

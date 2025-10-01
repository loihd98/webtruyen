const express = require("express");
const usersController = require("../controllers/usersController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// User profile routes
router.get("/me", usersController.getProfile);
router.get("/me", usersController.getProfile);
router.patch("/me", usersController.updateProfile);
router.post("/change-password", usersController.changePassword);

// User data routes
router.get("/me/bookmarks", usersController.getBookmarks);
router.get("/bookmarks", usersController.getBookmarks); // For compatibility with old API
router.get("/me/history", usersController.getReadingHistory);

module.exports = router;

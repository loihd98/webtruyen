const express = require("express");
const bookmarksController = require("../controllers/bookmarksController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All bookmark routes require authentication
router.use(authenticateToken);

// Create bookmark
router.post("/", bookmarksController.createBookmark);

// Toggle bookmark (create/delete)
router.post("/toggle", bookmarksController.toggleBookmark);

// Check if bookmarked
router.get("/check", bookmarksController.checkBookmark);

// Get user bookmarks
router.get("/", bookmarksController.getUserBookmarks);

// Delete bookmark
router.delete("/:id", bookmarksController.deleteBookmark);

module.exports = router;

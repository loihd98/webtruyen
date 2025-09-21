const express = require("express");
const chaptersController = require("../controllers/chaptersController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Get chapter content
router.get(
  "/stories/:slug/chapters/:number",
  optionalAuth,
  chaptersController.getChapter
);

// Get chapters list for a story
router.get(
  "/stories/:slug/chapters",
  optionalAuth,
  chaptersController.getChaptersList
);

// Unlock chapter (via affiliate click)
router.post("/:id/unlock", optionalAuth, chaptersController.unlockChapter);

module.exports = router;

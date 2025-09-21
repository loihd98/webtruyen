const express = require("express");
const storiesController = require("../controllers/storiesController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get("/", optionalAuth, storiesController.getStories);
router.get("/trending", optionalAuth, storiesController.getTrendingStories);
router.get("/latest", optionalAuth, storiesController.getLatestStories);
router.get(
  "/recommended",
  optionalAuth,
  storiesController.getRecommendedStories
);
router.get("/genres", storiesController.getGenres);
router.get("/:slug", optionalAuth, storiesController.getStoryBySlug);

module.exports = router;

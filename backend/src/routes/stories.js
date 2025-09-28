const express = require("express");
const storiesController = require("../controllers/storiesController");
const {
  optionalAuth,
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

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

// Admin routes for story management
router.get("/admin/stories", requireAdmin, storiesController.getAdminStories);
router.post("/", requireAuth, storiesController.createStory);
router.put("/:slug", requireAuth, storiesController.updateStory);
router.delete("/:slug", requireAuth, storiesController.deleteStory);

// Public story detail (must be last to avoid conflicts)
router.get("/:slug", optionalAuth, storiesController.getStoryBySlug);

module.exports = router;

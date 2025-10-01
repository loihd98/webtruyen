const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// User management
router.get("/users", adminController.getUsers);
router.patch("/users/:id/role", adminController.updateUserRole);

// Story management
router.get("/stories", adminController.getStories);
router.get("/stories/:id", adminController.getStoryById);
router.post("/stories", adminController.createStory);
router.patch("/stories/:id", adminController.updateStory);
router.delete("/stories/:id", adminController.deleteStory);

// Chapter management
router.get("/chapters", adminController.getChapters);
router.post("/stories/:storyId/chapters", adminController.createChapter);
router.patch("/chapters/:id", adminController.updateChapter);
router.delete("/chapters/:id", adminController.deleteChapter);

// Comment moderation
router.get("/comments/pending", adminController.getPendingComments);
router.patch("/comments/:id/approve", adminController.approveComment);
router.delete("/comments/:id/reject", adminController.rejectComment);

// Genre management
router.post("/genres", adminController.createGenre);
router.patch("/genres/:id", adminController.updateGenre);
router.delete("/genres/:id", adminController.deleteGenre);

// Affiliate link management
router.get("/affiliate-links", adminController.getAffiliateLinks);
router.post("/affiliate-links", adminController.createAffiliateLink);
router.patch("/affiliate-links/:id", adminController.updateAffiliateLink);
router.delete("/affiliate-links/:id", adminController.deleteAffiliateLink);

// Sample data and analytics
router.post("/sample-data", adminController.createSampleData);
router.get("/analytics", adminController.getAnalytics);

module.exports = router;

const express = require("express");
const affiliateController = require("../controllers/affiliateController");
const { requireAdmin, authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/redirect/:affiliateId", affiliateController.redirectAffiliate);

// Public endpoint to get active affiliate links (for popup)
router.get("/public/active", affiliateController.getPublicAffiliateLinks);

// Admin CRUD routes
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  affiliateController.getAffiliateLinks
);
router.get(
  "/search",
  authenticateToken,
  requireAdmin,
  affiliateController.searchAffiliateLinks
);
router.get(
  "/:id",
  authenticateToken,
  requireAdmin,
  affiliateController.getAffiliateLinkById
);
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  affiliateController.createAffiliateLink
);
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  affiliateController.updateAffiliateLink
);
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  affiliateController.deleteAffiliateLink
);

// Analytics routes (admin only)
router.get(
  "/:affiliateId/analytics",
  authenticateToken,
  requireAdmin,
  affiliateController.getAffiliateAnalytics
);
router.get(
  "/analytics/all",
  authenticateToken,
  requireAdmin,
  affiliateController.getAffiliateAnalytics
);

module.exports = router;

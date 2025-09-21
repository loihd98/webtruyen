const express = require("express");
const affiliateController = require("../controllers/affiliateController");
const { requireAdmin, authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Affiliate redirect (public)
router.get("/:affiliateId", affiliateController.redirectAffiliate);

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

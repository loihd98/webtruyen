const express = require("express");
const commentsController = require("../controllers/commentsController");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Get comments for a chapter (public)
router.get(
  "/chapters/:chapterId/comments",
  (req, res, next) => {
    console.log("Comment route hit:", req.path, req.params);
    next();
  },
  commentsController.getComments
);

// Create comment (requires auth)
router.post(
  "/chapters/:chapterId/comments",
  authenticateToken,
  commentsController.createComment
);

// Update comment (requires auth)
router.patch("/:id", authenticateToken, commentsController.updateComment);

// Delete comment (requires auth)
router.delete("/:id", authenticateToken, commentsController.deleteComment);

// Report comment (requires auth)
router.post("/:id/report", authenticateToken, commentsController.reportComment);

module.exports = router;

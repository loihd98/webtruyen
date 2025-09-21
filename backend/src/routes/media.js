const express = require("express");
const multer = require("multer");
const {
  MediaController,
  uploadAudio,
  uploadImage,
} = require("../controllers/mediaController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// All media routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Upload audio file
router.post("/upload/audio", uploadAudio, MediaController.uploadAudio);

// Upload image file
router.post("/upload/image", uploadImage, MediaController.uploadImage);

// Get file info
router.get("/files/:filename", MediaController.getFileInfo);

// List files
router.get("/files", MediaController.listFiles);

// Delete file
router.delete("/files/:filename", MediaController.deleteFile);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File Too Large",
        message: "File quá lớn, vui lòng chọn file nhỏ hơn",
      });
    }
  }

  if (error.message.includes("Chỉ cho phép upload")) {
    return res.status(400).json({
      error: "Invalid File Type",
      message: error.message,
    });
  }

  next(error);
});

module.exports = router;

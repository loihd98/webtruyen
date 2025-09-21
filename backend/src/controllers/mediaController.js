const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(config.uploadPath, "audio");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter for audio files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "audio/mpeg", // MP3
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/flac",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Chỉ cho phép upload file audio (MP3, WAV, OGG, AAC, FLAC)"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize, // 100MB
  },
});

class MediaController {
  // Upload audio file
  async uploadAudio(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Không có file được upload",
        });
      }

      const audioUrl = `/media/audio/${req.file.filename}`;

      res.json({
        message: "Upload thành công",
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: audioUrl,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error("Upload audio error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi upload file",
      });
    }
  }

  // Upload image file
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Không có file được upload",
        });
      }

      const imageUrl = `/media/images/${req.file.filename}`;

      res.json({
        message: "Upload thành công",
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: imageUrl,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error("Upload image error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi upload file",
      });
    }
  }

  // Delete file
  async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      const { type } = req.query; // 'audio' or 'image'

      if (!type || !["audio", "image"].includes(type)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Type phải là audio hoặc image",
        });
      }

      const filePath = path.join(config.uploadPath, type, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: "Not Found",
          message: "File không tồn tại",
        });
      }

      // Delete file
      fs.unlinkSync(filePath);

      res.json({
        message: "File đã được xóa",
      });
    } catch (error) {
      console.error("Delete file error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa file",
      });
    }
  }

  // Get file info
  async getFileInfo(req, res) {
    try {
      const { filename } = req.params;
      const { type } = req.query;

      if (!type || !["audio", "image"].includes(type)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Type phải là audio hoặc image",
        });
      }

      const filePath = path.join(config.uploadPath, type, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: "Not Found",
          message: "File không tồn tại",
        });
      }

      // Get file stats
      const stats = fs.statSync(filePath);

      res.json({
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: `/media/${type}/${filename}`,
      });
    } catch (error) {
      console.error("Get file info error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy thông tin file",
      });
    }
  }

  // List uploaded files
  async listFiles(req, res) {
    try {
      const { type } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      if (!type || !["audio", "image"].includes(type)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Type phải là audio hoặc image",
        });
      }

      const dirPath = path.join(config.uploadPath, type);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        return res.json({
          files: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        });
      }

      // Get all files
      const allFiles = fs.readdirSync(dirPath);
      const total = allFiles.length;

      // Paginate
      const skip = (page - 1) * limit;
      const files = allFiles
        .slice(skip, skip + limit)
        .map((filename) => {
          const filePath = path.join(dirPath, filename);
          const stats = fs.statSync(filePath);

          return {
            filename,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            url: `/media/${type}/${filename}`,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        files,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("List files error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách file",
      });
    }
  }
}

// Configure image upload
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(config.uploadPath, "images");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP)"), false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
});

module.exports = {
  MediaController: new MediaController(),
  uploadAudio: upload.single("audio"),
  uploadImage: uploadImage.single("image"),
};

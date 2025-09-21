const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const validationService = require("../utils/validationService");

const prisma = new PrismaClient();

class UsersController {
  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              bookmarks: true,
              comments: true,
              stories: true,
              unlockedChapters: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          error: "Not Found",
          message: "Người dùng không tồn tại",
        });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy thông tin người dùng",
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, avatar } = req.body;
      const updateData = {};

      if (name !== undefined) {
        validationService.validateName(name);
        updateData.name = name.trim();
      }

      if (avatar !== undefined) {
        updateData.avatar = avatar;
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });

      res.json({
        message: "Cập nhật thông tin thành công",
        user,
      });
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật thông tin",
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      validationService.validatePassword(currentPassword);
      validationService.validatePassword(newPassword);

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user || !user.passwordHash) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Tài khoản không có mật khẩu (OAuth account)",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Mật khẩu hiện tại không đúng",
        });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash: newPasswordHash },
      });

      res.json({
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      console.error("Change password error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi đổi mật khẩu",
      });
    }
  }

  // Get user bookmarks
  async getBookmarks(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: req.user.id },
        include: {
          story: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              thumbnailUrl: true,
              type: true,
              viewCount: true,
              updatedAt: true,
              author: {
                select: {
                  name: true,
                },
              },
            },
          },
          chapter: {
            select: {
              id: true,
              number: true,
              title: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const total = await prisma.bookmark.count({
        where: { userId: req.user.id },
      });

      res.json({
        bookmarks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get bookmarks error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách bookmark",
      });
    }
  }

  // Get user reading history
  async getReadingHistory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Get unlocked chapters as reading history
      const history = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          unlockedChapters: {
            include: {
              story: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  thumbnailUrl: true,
                  type: true,
                  author: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: { updatedAt: "desc" },
            skip,
            take: limit,
          },
        },
      });

      const totalUnlocked = await prisma.chapter.count({
        where: {
          unlockedBy: {
            some: {
              id: req.user.id,
            },
          },
        },
      });

      res.json({
        history: history?.unlockedChapters || [],
        pagination: {
          page,
          limit,
          total: totalUnlocked,
          pages: Math.ceil(totalUnlocked / limit),
        },
      });
    } catch (error) {
      console.error("Get reading history error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy lịch sử đọc",
      });
    }
  }
}

module.exports = new UsersController();

const { PrismaClient } = require("@prisma/client");
const validationService = require("../utils/validationService");

const prisma = new PrismaClient();

class CommentsController {
  // Get comments for a chapter
  async getComments(req, res) {
    try {
      const { chapterId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Verify chapter exists
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: { id: true, title: true },
      });

      if (!chapter) {
        return res.status(404).json({
          error: "Not Found",
          message: "Chương không tồn tại",
        });
      }

      // Get top-level comments (not replies)
      const comments = await prisma.comment.findMany({
        where: {
          chapterId,
          parentId: null,
          isApproved: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  role: true,
                },
              },
            },
            where: {
              isApproved: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });

      const total = await prisma.comment.count({
        where: {
          chapterId,
          parentId: null,
          isApproved: true,
        },
      });

      res.json({
        data: {
          comments,
          chapter: {
            id: chapter.id,
            title: chapter.title,
          },
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy bình luận",
      });
    }
  }

  // Create new comment
  async createComment(req, res) {
    try {
      const { chapterId } = req.params;
      const { content, parentId } = req.body;

      // Validation
      validationService.validateCommentData({ content });

      // Verify chapter exists
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: { id: true },
      });

      if (!chapter) {
        return res.status(404).json({
          error: "Not Found",
          message: "Chương không tồn tại",
        });
      }

      // If parentId provided, verify parent comment exists
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
        });

        if (!parentComment || parentComment.chapterId !== chapterId) {
          return res.status(400).json({
            error: "Bad Request",
            message: "Bình luận cha không hợp lệ",
          });
        }
      }

      // Create comment (auto-approve for now, can add moderation later)
      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          userId: req.user.id,
          chapterId,
          parentId: parentId || null,
          isApproved: true, // Auto-approve, can change to false for moderation
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      res.status(201).json({
        message: "Bình luận đã được tạo",
        data: {
          comment,
        },
      });
    } catch (error) {
      console.error("Create comment error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
          details: error.details,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo bình luận",
      });
    }
  }

  // Update comment (only by author or admin)
  async updateComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      // Validation
      validationService.validateCommentData({ content });

      // Get comment
      const comment = await prisma.comment.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!comment) {
        return res.status(404).json({
          error: "Not Found",
          message: "Bình luận không tồn tại",
        });
      }

      // Check permission (author or admin)
      if (comment.userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({
          error: "Forbidden",
          message: "Bạn không có quyền chỉnh sửa bình luận này",
        });
      }

      // Update comment
      const updatedComment = await prisma.comment.update({
        where: { id },
        data: {
          content: content.trim(),
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      res.json({
        message: "Bình luận đã được cập nhật",
        data: {
          comment: updatedComment,
        },
      });
    } catch (error) {
      console.error("Update comment error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
          details: error.details,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật bình luận",
      });
    }
  }

  // Delete comment (only by author or admin)
  async deleteComment(req, res) {
    try {
      const { id } = req.params;

      // Get comment
      const comment = await prisma.comment.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!comment) {
        return res.status(404).json({
          error: "Not Found",
          message: "Bình luận không tồn tại",
        });
      }

      // Check permission (author or admin)
      if (comment.userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({
          error: "Forbidden",
          message: "Bạn không có quyền xóa bình luận này",
        });
      }

      // Delete comment and its replies
      await prisma.comment.deleteMany({
        where: {
          OR: [{ id }, { parentId: id }],
        },
      });

      res.json({
        message: "Bình luận đã được xóa",
      });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa bình luận",
      });
    }
  }

  // Report comment
  async reportComment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Get comment
      const comment = await prisma.comment.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!comment) {
        return res.status(404).json({
          error: "Not Found",
          message: "Bình luận không tồn tại",
        });
      }

      // For now, just log the report (in real app, you'd store reports in DB)
      console.log(
        `Comment ${id} reported by user ${req.user.id} for reason: ${reason}`
      );

      res.json({
        message: "Báo cáo đã được gửi, chúng tôi sẽ xem xét sớm nhất",
      });
    } catch (error) {
      console.error("Report comment error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi báo cáo bình luận",
      });
    }
  }
}

module.exports = new CommentsController();

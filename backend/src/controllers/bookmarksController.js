const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class BookmarksController {
  // Create bookmark
  async createBookmark(req, res) {
    try {
      const { storyId, chapterId } = req.body;

      // Validate that at least one of storyId or chapterId is provided
      if (!storyId && !chapterId) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Cần cung cấp storyId hoặc chapterId",
        });
      }

      // If storyId provided, verify story exists
      if (storyId) {
        const story = await prisma.story.findUnique({
          where: { id: storyId },
          select: { id: true, title: true },
        });

        if (!story) {
          return res.status(404).json({
            error: "Not Found",
            message: "Truyện không tồn tại",
          });
        }
      }

      // If chapterId provided, verify chapter exists
      if (chapterId) {
        const chapter = await prisma.chapter.findUnique({
          where: { id: chapterId },
          select: { id: true, title: true, storyId: true },
        });

        if (!chapter) {
          return res.status(404).json({
            error: "Not Found",
            message: "Chương không tồn tại",
          });
        }

        // If both storyId and chapterId provided, ensure they match
        if (storyId && chapter.storyId !== storyId) {
          return res.status(400).json({
            error: "Bad Request",
            message: "Chương không thuộc truyện được chỉ định",
          });
        }
      }

      // Check if bookmark already exists
      const existingBookmark = await prisma.bookmark.findFirst({
        where: {
          userId: req.user.id,
          storyId: storyId || null,
          chapterId: chapterId || null,
        },
      });

      if (existingBookmark) {
        return res.status(400).json({
          error: "Conflict",
          message: "Bookmark đã tồn tại",
        });
      }

      // Create bookmark
      const bookmark = await prisma.bookmark.create({
        data: {
          userId: req.user.id,
          storyId: storyId || null,
          chapterId: chapterId || null,
        },
        include: {
          story: storyId
            ? {
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
              }
            : undefined,
          chapter: chapterId
            ? {
                select: {
                  id: true,
                  number: true,
                  title: true,
                  story: {
                    select: {
                      id: true,
                      slug: true,
                      title: true,
                      thumbnailUrl: true,
                      type: true,
                    },
                  },
                },
              }
            : undefined,
        },
      });

      res.status(201).json({
        message: "Bookmark đã được tạo",
        bookmark,
      });
    } catch (error) {
      console.error("Create bookmark error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo bookmark",
      });
    }
  }

  // Delete bookmark
  async deleteBookmark(req, res) {
    try {
      const { id } = req.params;

      // Get bookmark
      const bookmark = await prisma.bookmark.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!bookmark) {
        return res.status(404).json({
          error: "Not Found",
          message: "Bookmark không tồn tại",
        });
      }

      // Check permission
      if (bookmark.userId !== req.user.id) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Bạn không có quyền xóa bookmark này",
        });
      }

      // Delete bookmark
      await prisma.bookmark.delete({
        where: { id },
      });

      res.json({
        message: "Bookmark đã được xóa",
      });
    } catch (error) {
      console.error("Delete bookmark error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa bookmark",
      });
    }
  }

  // Toggle bookmark (create if not exists, delete if exists)
  async toggleBookmark(req, res) {
    try {
      const { storyId, chapterId } = req.body;

      // Validate input
      if (!storyId && !chapterId) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Cần cung cấp storyId hoặc chapterId",
        });
      }

      // Check if bookmark exists
      const existingBookmark = await prisma.bookmark.findFirst({
        where: {
          userId: req.user.id,
          storyId: storyId || null,
          chapterId: chapterId || null,
        },
      });

      if (existingBookmark) {
        // Delete existing bookmark
        await prisma.bookmark.delete({
          where: { id: existingBookmark.id },
        });

        return res.json({
          message: "Bookmark đã được xóa",
          action: "removed",
        });
      } else {
        // Create new bookmark
        const bookmark = await prisma.bookmark.create({
          data: {
            userId: req.user.id,
            storyId: storyId || null,
            chapterId: chapterId || null,
          },
          include: {
            story: storyId
              ? {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    thumbnailUrl: true,
                    type: true,
                  },
                }
              : undefined,
            chapter: chapterId
              ? {
                  select: {
                    id: true,
                    number: true,
                    title: true,
                  },
                }
              : undefined,
          },
        });

        return res.status(201).json({
          message: "Bookmark đã được tạo",
          action: "added",
          bookmark,
        });
      }
    } catch (error) {
      console.error("Toggle bookmark error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi toggle bookmark",
      });
    }
  }

  // Check if item is bookmarked
  async checkBookmark(req, res) {
    try {
      const { storyId, chapterId } = req.query;

      if (!storyId && !chapterId) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Cần cung cấp storyId hoặc chapterId",
        });
      }

      const bookmark = await prisma.bookmark.findFirst({
        where: {
          userId: req.user.id,
          storyId: storyId || null,
          chapterId: chapterId || null,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      res.json({
        isBookmarked: !!bookmark,
        bookmark: bookmark || null,
      });
    } catch (error) {
      console.error("Check bookmark error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi kiểm tra bookmark",
      });
    }
  }

  // Get user's bookmarks (handled in users controller, but keep for direct access)
  async getUserBookmarks(req, res) {
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
              story: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  thumbnailUrl: true,
                  type: true,
                },
              },
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
      console.error("Get user bookmarks error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách bookmark",
      });
    }
  }
}

module.exports = new BookmarksController();

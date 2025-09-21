const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class ChaptersController {
  // Get chapter by story slug and chapter number
  async getChapter(req, res) {
    try {
      const { slug, number } = req.params;
      const chapterNumber = parseInt(number);

      if (isNaN(chapterNumber) || chapterNumber < 1) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Số chương không hợp lệ",
        });
      }

      // Get story first
      const story = await prisma.story.findUnique({
        where: {
          slug,
          status: "PUBLISHED",
        },
        select: {
          id: true,
          title: true,
          type: true,
          slug: true,
        },
      });

      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Truyện không tồn tại",
        });
      }

      // Get chapter
      const chapter = await prisma.chapter.findUnique({
        where: {
          storyId_number: {
            storyId: story.id,
            number: chapterNumber,
          },
        },
        include: {
          story: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              author: {
                select: {
                  name: true,
                },
              },
            },
          },
          unlockedBy: req.user
            ? {
                where: {
                  id: req.user.id,
                },
                select: {
                  id: true,
                },
              }
            : false,
        },
      });

      if (!chapter) {
        return res.status(404).json({
          error: "Not Found",
          message: "Chương không tồn tại",
        });
      }

      // Check if chapter is unlocked
      const isUnlocked =
        !chapter.isLocked ||
        (chapter.unlockedBy && chapter.unlockedBy.length > 0);

      // If locked and user not authenticated, return limited info
      if (chapter.isLocked && !isUnlocked) {
        return res.json({
          chapter: {
            id: chapter.id,
            number: chapter.number,
            title: chapter.title,
            isLocked: true,
            isUnlocked: false,
            story: chapter.story,
            createdAt: chapter.createdAt,
          },
        });
      }

      // Return full chapter content
      const response = {
        ...chapter,
        isUnlocked,
        unlockedBy: undefined, // Remove sensitive data
      };

      res.json({ chapter: response });
    } catch (error) {
      console.error("Get chapter error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy nội dung chương",
      });
    }
  }

  // Unlock chapter (via affiliate click)
  async unlockChapter(req, res) {
    try {
      const { id } = req.params;

      const chapter = await prisma.chapter.findUnique({
        where: { id },
        include: {
          story: {
            include: {
              affiliate: true,
            },
          },
        },
      });

      if (!chapter) {
        return res.status(404).json({
          error: "Not Found",
          message: "Chương không tồn tại",
        });
      }

      if (!chapter.isLocked) {
        return res.json({
          message: "Chương đã được mở khóa",
          isUnlocked: true,
        });
      }

      // If user is authenticated, save unlock to database
      if (req.user) {
        // Check if already unlocked
        const existingUnlock = await prisma.chapter.findFirst({
          where: {
            id: chapter.id,
            unlockedBy: {
              some: {
                id: req.user.id,
              },
            },
          },
        });

        if (!existingUnlock) {
          // Add user to unlocked list
          await prisma.chapter.update({
            where: { id: chapter.id },
            data: {
              unlockedBy: {
                connect: {
                  id: req.user.id,
                },
              },
            },
          });
        }

        // Log analytics
        await prisma.analytics.create({
          data: {
            event: "chapter_unlock",
            userId: req.user.id,
            storyId: chapter.storyId,
            affiliateId: chapter.story.affiliate?.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          },
        });
      } else {
        // For anonymous users, log without userId
        await prisma.analytics.create({
          data: {
            event: "chapter_unlock",
            storyId: chapter.storyId,
            affiliateId: chapter.story.affiliate?.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          },
        });
      }

      res.json({
        message: "Chương đã được mở khóa",
        isUnlocked: true,
        chapter: {
          id: chapter.id,
          number: chapter.number,
          title: chapter.title,
          content: chapter.content,
          audioUrl: chapter.audioUrl,
        },
      });
    } catch (error) {
      console.error("Unlock chapter error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi mở khóa chương",
      });
    }
  }

  // Get chapters list for a story
  async getChaptersList(req, res) {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      // Get story
      const story = await prisma.story.findUnique({
        where: {
          slug,
          status: "PUBLISHED",
        },
        select: {
          id: true,
          title: true,
          type: true,
        },
      });

      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Truyện không tồn tại",
        });
      }

      // Get chapters
      const chapters = await prisma.chapter.findMany({
        where: { storyId: story.id },
        select: {
          id: true,
          number: true,
          title: true,
          isLocked: true,
          audioUrl: true,
          createdAt: true,
          unlockedBy: req.user
            ? {
                where: {
                  id: req.user.id,
                },
                select: {
                  id: true,
                },
              }
            : false,
        },
        orderBy: { number: "asc" },
        skip,
        take: limit,
      });

      const total = await prisma.chapter.count({
        where: { storyId: story.id },
      });

      // Add unlock status
      const chaptersWithStatus = chapters.map((chapter) => ({
        ...chapter,
        isUnlocked:
          !chapter.isLocked ||
          (chapter.unlockedBy && chapter.unlockedBy.length > 0),
        unlockedBy: undefined,
      }));

      res.json({
        chapters: chaptersWithStatus,
        story: {
          id: story.id,
          title: story.title,
          type: story.type,
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get chapters list error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách chương",
      });
    }
  }
}

module.exports = new ChaptersController();

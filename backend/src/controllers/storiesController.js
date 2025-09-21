const { PrismaClient } = require("@prisma/client");
const slugify = require("slugify");
const validationService = require("../utils/validationService");

const prisma = new PrismaClient();

class StoriesController {
  // Get all stories with filters
  async getStories(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const { type, genre, search, sort = "createdAt" } = req.query;

      // Build where clause
      const where = {
        status: "PUBLISHED",
      };

      if (type && ["TEXT", "AUDIO"].includes(type)) {
        where.type = type;
      }

      if (genre) {
        where.genres = {
          some: {
            slug: genre,
          },
        };
      }

      if (search) {
        where.OR = [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            author: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ];
      }

      // Build orderBy clause
      let orderBy = { createdAt: "desc" };
      if (sort === "viewCount") {
        orderBy = { viewCount: "desc" };
      } else if (sort === "updatedAt") {
        orderBy = { updatedAt: "desc" };
      } else if (sort === "title") {
        orderBy = { title: "asc" };
      }

      const stories = await prisma.story.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
            },
          },
          genres: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              bookmarks: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      });

      const total = await prisma.story.count({ where });

      res.json({
        data: {
          data: stories,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách truyện",
      });
    }
  }

  // Get story by slug
  async getStoryBySlug(req, res) {
    try {
      const { slug } = req.params;

      const story = await prisma.story.findUnique({
        where: {
          slug,
          status: "PUBLISHED",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          genres: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          affiliate: {
            select: {
              id: true,
              provider: true,
              label: true,
              isActive: true,
            },
          },
          chapters: {
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
            orderBy: {
              number: "asc",
            },
          },
          _count: {
            select: {
              chapters: true,
              bookmarks: true,
            },
          },
        },
      });

      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Truyện không tồn tại",
        });
      }

      // Increment view count
      await prisma.story.update({
        where: { id: story.id },
        data: { viewCount: { increment: 1 } },
      });

      // Add unlock status to chapters
      story.chapters = story.chapters.map((chapter) => ({
        ...chapter,
        isUnlocked:
          !chapter.isLocked ||
          (chapter.unlockedBy && chapter.unlockedBy.length > 0),
      }));

      res.json({ story });
    } catch (error) {
      console.error("Get story error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy thông tin truyện",
      });
    }
  }

  // Get trending stories
  async getTrendingStories(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const type = req.query.type;

      const where = {
        status: "PUBLISHED",
      };

      if (type && ["TEXT", "AUDIO"].includes(type)) {
        where.type = type;
      }

      const stories = await prisma.story.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
            },
          },
          genres: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              bookmarks: true,
            },
          },
        },
        orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
        take: limit,
      });

      res.json({ stories });
    } catch (error) {
      console.error("Get trending stories error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy truyện hot",
      });
    }
  }

  // Get latest updated stories
  async getLatestStories(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const type = req.query.type;

      const where = {
        status: "PUBLISHED",
      };

      if (type && ["TEXT", "AUDIO"].includes(type)) {
        where.type = type;
      }

      const stories = await prisma.story.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
            },
          },
          genres: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              bookmarks: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      });

      res.json({ stories });
    } catch (error) {
      console.error("Get latest stories error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy truyện mới cập nhật",
      });
    }
  }

  // Get recommended stories (simple algorithm based on genres)
  async getRecommendedStories(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const type = req.query.type;

      let genreIds = [];

      // If user is logged in, get their favorite genres from bookmarks
      if (req.user) {
        const userBookmarks = await prisma.bookmark.findMany({
          where: { userId: req.user.id },
          include: {
            story: {
              include: {
                genres: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });

        const allGenres = userBookmarks
          .map((bookmark) => bookmark.story?.genres || [])
          .flat()
          .map((genre) => genre.id);

        // Count genre frequency
        const genreCount = {};
        allGenres.forEach((genreId) => {
          genreCount[genreId] = (genreCount[genreId] || 0) + 1;
        });

        // Get top genres
        genreIds = Object.entries(genreCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([genreId]) => genreId);
      }

      const where = {
        status: "PUBLISHED",
      };

      if (type && ["TEXT", "AUDIO"].includes(type)) {
        where.type = type;
      }

      // If we have favorite genres, prioritize them
      if (genreIds.length > 0) {
        where.genres = {
          some: {
            id: {
              in: genreIds,
            },
          },
        };
      }

      const stories = await prisma.story.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
            },
          },
          genres: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              bookmarks: true,
            },
          },
        },
        orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
        take: limit,
      });

      // If not enough stories with favorite genres, get popular stories
      if (stories.length < limit) {
        const additionalStories = await prisma.story.findMany({
          where: {
            status: "PUBLISHED",
            id: {
              notIn: stories.map((s) => s.id),
            },
            ...(type && ["TEXT", "AUDIO"].includes(type) && { type }),
          },
          include: {
            author: {
              select: {
                name: true,
              },
            },
            genres: {
              select: {
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                chapters: true,
                bookmarks: true,
              },
            },
          },
          orderBy: { viewCount: "desc" },
          take: limit - stories.length,
        });

        stories.push(...additionalStories);
      }

      res.json({ stories });
    } catch (error) {
      console.error("Get recommended stories error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy truyện đề xuất",
      });
    }
  }

  // Get all genres
  async getGenres(req, res) {
    try {
      const genres = await prisma.genre.findMany({
        include: {
          _count: {
            select: {
              stories: {
                where: {
                  status: "PUBLISHED",
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      res.json({ genres });
    } catch (error) {
      console.error("Get genres error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách thể loại",
      });
    }
  }
}

module.exports = new StoriesController();

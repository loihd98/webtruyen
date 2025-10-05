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
        // Normalize search term: remove accents, convert to lowercase, and split into words
        const normalizeString = (str) => {
          return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[đĐ]/g, "d"); // Replace đ/Đ with d
        };

        const normalizedSearch = normalizeString(search);
        const searchWords = normalizedSearch
          .split(/\s+/)
          .filter((word) => word.length > 0);

        where.OR = [
          // Search by exact match in title
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          // Search by individual words in title
          ...searchWords.map((word) => ({
            title: {
              contains: word,
              mode: "insensitive",
            },
          })),
          // Search in slug
          {
            slug: {
              contains: normalizedSearch.replace(/\s+/g, "-"),
              mode: "insensitive",
            },
          },
          // Search by individual words in slug
          ...searchWords.map((word) => ({
            slug: {
              contains: word,
              mode: "insensitive",
            },
          })),
          // Search in description
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          // Search in author name
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
          affiliate: {
            select: {
              id: true,
              provider: true,
              targetUrl: true,
              label: true,
              isActive: true,
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
              content: true,
              isLocked: true,
              audioUrl: true,
              affiliateId: true,
              affiliate: {
                select: {
                  id: true,
                  provider: true,
                  targetUrl: true,
                  label: true,
                  isActive: true,
                },
              },
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
          affiliate: {
            select: {
              id: true,
              provider: true,
              targetUrl: true,
              label: true,
              isActive: true,
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
          affiliate: {
            select: {
              id: true,
              provider: true,
              targetUrl: true,
              label: true,
              isActive: true,
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
          affiliate: {
            select: {
              id: true,
              provider: true,
              targetUrl: true,
              label: true,
              isActive: true,
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
            affiliate: {
              select: {
                id: true,
                provider: true,
                targetUrl: true,
                label: true,
                isActive: true,
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

  // Create new story (Admin only)
  async createStory(req, res) {
    try {
      const {
        title,
        description,
        type,
        genreIds,
        affiliateId,
        audioUrl,
        thumbnailUrl,
      } = req.body;
      const authorId = req.user.id;

      // Validation
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Tiêu đề truyện là bắt buộc",
        });
      }

      if (!type || !["TEXT", "AUDIO"].includes(type)) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Loại truyện không hợp lệ. Chỉ được TEXT hoặc AUDIO",
        });
      }

      // Generate slug
      const slug = slugify(title, { lower: true, strict: true });

      // Check if slug exists
      const existingStory = await prisma.story.findUnique({ where: { slug } });
      let finalSlug = slug;
      let counter = 1;

      while (existingStory) {
        finalSlug = `${slug}-${counter}`;
        const slugExists = await prisma.story.findUnique({
          where: { slug: finalSlug },
        });
        if (!slugExists) break;
        counter++;
      }

      // Create story with genre connections
      const storyData = {
        title: title.trim(),
        description: description?.trim(),
        slug: finalSlug,
        type,
        status: "DRAFT", // Default to draft
        authorId,
      };

      if (affiliateId) {
        storyData.affiliateId = affiliateId;
      }

      if (audioUrl) {
        storyData.audioUrl = audioUrl;
      }

      if (thumbnailUrl) {
        storyData.thumbnailUrl = thumbnailUrl;
      }

      if (genreIds && genreIds.length > 0) {
        storyData.genres = {
          connect: genreIds.map((id) => ({ id })),
        };
      }

      const story = await prisma.story.create({
        data: storyData,
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
            },
          },
        },
      });

      res.status(201).json({
        message: "Tạo truyện thành công",
        story,
      });
    } catch (error) {
      console.error("Create story error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo truyện",
      });
    }
  }

  // Update story (Admin/Author only)
  async updateStory(req, res) {
    try {
      const { slug } = req.params;
      const {
        title,
        description,
        type,
        genreIds,
        affiliateId,
        status,
        thumbnailUrl,
        audioUrl,
      } = req.body;

      // Find existing story
      const existingStory = await prisma.story.findUnique({
        where: { slug },
        include: { author: true },
      });

      if (!existingStory) {
        return res.status(404).json({
          error: "Not Found",
          message: "Truyện không tồn tại",
        });
      }

      // Check permission (admin or author)
      if (req.user.role !== "ADMIN" && req.user.id !== existingStory.authorId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Bạn không có quyền cập nhật truyện này",
        });
      }

      // Build update data
      const updateData = {};

      if (title && title !== existingStory.title) {
        updateData.title = title.trim();
        updateData.slug = slugify(title, { lower: true, strict: true });
      }

      if (description !== undefined) {
        updateData.description = description?.trim();
      }

      if (type && ["TEXT", "AUDIO"].includes(type)) {
        updateData.type = type;
      }

      if (status && ["DRAFT", "PUBLISHED", "HIDDEN"].includes(status)) {
        updateData.status = status;
      }

      if (thumbnailUrl !== undefined) {
        updateData.thumbnailUrl = thumbnailUrl;
      }

      if (audioUrl !== undefined) {
        updateData.audioUrl = audioUrl;
      }

      if (affiliateId !== undefined) {
        updateData.affiliateId = affiliateId;
      }

      // Handle genres update
      if (genreIds) {
        updateData.genres = {
          set: [], // Clear existing
          connect: genreIds.map((id) => ({ id })),
        };
      }

      const updatedStory = await prisma.story.update({
        where: { slug },
        data: updateData,
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
            },
          },
        },
      });

      res.json({
        message: "Cập nhật truyện thành công",
        story: updatedStory,
      });
    } catch (error) {
      console.error("Update story error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật truyện",
      });
    }
  }

  // Delete story (Admin/Author only)
  async deleteStory(req, res) {
    try {
      const { slug } = req.params;

      // Find existing story
      const existingStory = await prisma.story.findUnique({
        where: { slug },
        include: { author: true },
      });

      if (!existingStory) {
        return res.status(404).json({
          error: "Not Found",
          message: "Truyện không tồn tại",
        });
      }

      // Check permission (admin or author)
      if (req.user.role !== "ADMIN" && req.user.id !== existingStory.authorId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Bạn không có quyền xóa truyện này",
        });
      }

      // Delete story (cascade will handle related data)
      await prisma.story.delete({
        where: { slug },
      });

      res.json({
        message: "Xóa truyện thành công",
      });
    } catch (error) {
      console.error("Delete story error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa truyện",
      });
    }
  }

  // Get stories for admin (all stories including drafts)
  async getAdminStories(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const { type, genre, search, status, sort = "createdAt" } = req.query;

      // Build where clause (admin can see all stories)
      const where = {};

      if (type && ["TEXT", "AUDIO"].includes(type)) {
        where.type = type;
      }

      if (status && ["DRAFT", "PUBLISHED", "HIDDEN"].includes(status)) {
        where.status = status;
      }

      if (genre) {
        where.genres = {
          some: {
            slug: genre,
          },
        };
      }

      if (search) {
        // Normalize search term for admin search as well
        const normalizeString = (str) => {
          return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[đĐ]/g, "d"); // Replace đ/Đ with d
        };

        const normalizedSearch = normalizeString(search);
        const searchWords = normalizedSearch
          .split(/\s+/)
          .filter((word) => word.length > 0);

        where.OR = [
          // Search by exact match in title
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          // Search by individual words in title
          ...searchWords.map((word) => ({
            title: {
              contains: word,
              mode: "insensitive",
            },
          })),
          // Search in slug
          {
            slug: {
              contains: normalizedSearch.replace(/\s+/g, "-"),
              mode: "insensitive",
            },
          },
          // Search by individual words in slug
          ...searchWords.map((word) => ({
            slug: {
              contains: word,
              mode: "insensitive",
            },
          })),
          // Search in description
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      const [stories, total] = await Promise.all([
        prisma.story.findMany({
          where,
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
                targetUrl: true,
                label: true,
                isActive: true,
              },
            },
            _count: {
              select: {
                chapters: true,
                bookmarks: true,
              },
            },
          },
          orderBy: {
            [sort]: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.story.count({ where }),
      ]);

      res.json({
        message: "Lấy danh sách truyện thành công",
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
      console.error("Get admin stories error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách truyện",
      });
    }
  }
}

module.exports = new StoriesController();

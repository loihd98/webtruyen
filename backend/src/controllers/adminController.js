const { PrismaClient } = require("@prisma/client");
const slugify = require("slugify");
const validationService = require("../utils/validationService");

const prisma = new PrismaClient();

class AdminController {
  // Dashboard stats
  async getDashboardStats(req, res) {
    try {
      const [
        totalUsers,
        totalStories,
        totalChapters,
        totalComments,
        totalViews,
        recentUsers,
        recentStories,
        adminUsers,
        topStories,
      ] = await Promise.all([
        // Basic counts
        prisma.user.count(),
        prisma.story.count(),
        prisma.chapter.count(),
        prisma.comment.count(),

        // Total views
        prisma.story.aggregate({
          _sum: {
            viewCount: true,
          },
        }),

        // Recent users (last 30 days)
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Recent stories (last 7 days)
        prisma.story.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Admin users count
        prisma.user.count({
          where: {
            role: "ADMIN",
          },
        }),

        // Top 5 stories by views
        prisma.story.findMany({
          take: 5,
          orderBy: {
            viewCount: "desc",
          },
          select: {
            title: true,
            slug: true,
            viewCount: true,
            type: true,
          },
        }),
      ]);

      res.json({
        totalUsers,
        totalStories,
        totalChapters,
        totalComments,
        totalViews: totalViews._sum.viewCount || 0,
        activeUsers: totalUsers, // For now, consider all users as active
        newUsers: recentUsers,
        adminUsers,
        recentStories,
        topStories,
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy thống kê dashboard",
      });
    }
  }

  // Manage Users
  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const { search, role } = req.query;

      const where = {};

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      if (role && ["USER", "ADMIN"].includes(role)) {
        where.role = role;
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              stories: true,
              comments: true,
              bookmarks: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });

      const total = await prisma.user.count({ where });

      res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách người dùng",
      });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!["USER", "ADMIN"].includes(role)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Role phải là USER hoặc ADMIN",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return res.status(404).json({
          error: "Not Found",
          message: "Người dùng không tồn tại",
        });
      }

      // Prevent self-demotion from admin
      if (user.id === req.user.id && user.role === "ADMIN" && role === "USER") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Không thể tự xóa quyền admin của chính mình",
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
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
        message: "Cập nhật role thành công",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật role",
      });
    }
  }

  // Manage Stories
  async getStories(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        type = "",
        status = "",
        authorId = "",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { author: { name: { contains: search, mode: "insensitive" } } },
          ],
        }),
        ...(type && { type }),
        ...(status && { status }),
        ...(authorId && { authorId }),
      };

      const [stories, total] = await Promise.all([
        prisma.story.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            genres: {
              select: {
                id: true,
                name: true,
              },
            },
            affiliate: {
              select: {
                id: true,
                provider: true,
                label: true,
              },
            },
            _count: {
              select: {
                chapters: true,
                bookmarks: true,
                comments: true,
              },
            },
          },
        }),
        prisma.story.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          stories,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
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

  async getStoryById(req, res) {
    try {
      const { id } = req.params;

      const story = await prisma.story.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          genres: {
            select: {
              id: true,
              name: true,
            },
          },
          affiliate: {
            select: {
              id: true,
              provider: true,
              label: true,
              targetUrl: true,
            },
          },
          chapters: {
            select: {
              id: true,
              title: true,
              chapterNumber: true,
              isLocked: true,
              createdAt: true,
            },
            orderBy: {
              chapterNumber: "asc",
            },
          },
          _count: {
            select: {
              chapters: true,
              bookmarks: true,
              comments: true,
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

      res.json({
        success: true,
        data: { story },
      });
    } catch (error) {
      console.error("Get story by ID error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy thông tin truyện",
      });
    }
  }

  async createStory(req, res) {
    try {
      const { title, description, type, thumbnailUrl, genreIds, affiliateId } =
        req.body;

      // Validation
      validationService.validateStoryData({ title, description, type });

      // Generate slug
      const baseSlug = slugify(title, { lower: true });
      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (await prisma.story.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create story
      const story = await prisma.story.create({
        data: {
          title: title.trim(),
          slug,
          description: description?.trim() || null,
          type,
          thumbnailUrl: thumbnailUrl || null,
          authorId: req.user.id,
          affiliateId: affiliateId || null,
          genres: genreIds
            ? {
                connect: genreIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
          genres: true,
          affiliate: true,
        },
      });

      res.status(201).json({
        message: "Tạo truyện thành công",
        story,
      });
    } catch (error) {
      console.error("Create story error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
          details: error.details,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo truyện",
      });
    }
  }

  async updateStory(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        type,
        thumbnailUrl,
        genreIds,
        affiliateId,
        status,
      } = req.body;

      const updateData = {};

      if (title !== undefined) {
        validationService.validateStoryData({ title, type: type || "TEXT" });
        updateData.title = title.trim();

        // Update slug if title changed
        const baseSlug = slugify(title, { lower: true });
        let slug = baseSlug;
        let counter = 1;

        while (
          await prisma.story.findFirst({
            where: {
              slug,
              id: { not: id },
            },
          })
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        updateData.slug = slug;
      }

      if (description !== undefined) {
        updateData.description = description?.trim() || null;
      }

      if (type !== undefined) {
        if (!["TEXT", "AUDIO"].includes(type)) {
          return res.status(400).json({
            error: "Bad Request",
            message: "Type phải là TEXT hoặc AUDIO",
          });
        }
        updateData.type = type;
      }

      if (thumbnailUrl !== undefined) {
        updateData.thumbnailUrl = thumbnailUrl || null;
      }

      if (affiliateId !== undefined) {
        updateData.affiliateId = affiliateId || null;
      }

      if (status !== undefined) {
        if (!["DRAFT", "PUBLISHED", "HIDDEN"].includes(status)) {
          return res.status(400).json({
            error: "Bad Request",
            message: "Status phải là DRAFT, PUBLISHED hoặc HIDDEN",
          });
        }
        updateData.status = status;
      }

      if (genreIds !== undefined) {
        updateData.genres = {
          set: genreIds.map((id) => ({ id })),
        };
      }

      const story = await prisma.story.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              name: true,
            },
          },
          genres: true,
          affiliate: true,
        },
      });

      res.json({
        message: "Cập nhật truyện thành công",
        story,
      });
    } catch (error) {
      console.error("Update story error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Truyện không tồn tại",
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật truyện",
      });
    }
  }

  async deleteStory(req, res) {
    try {
      const { id } = req.params;

      // Check if story exists
      const story = await prisma.story.findUnique({
        where: { id },
        select: { id: true, title: true },
      });

      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Truyện không tồn tại",
        });
      }

      // Delete story (cascading delete will handle chapters, comments, etc.)
      await prisma.story.delete({
        where: { id },
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

  // Manage Chapters
  async getChapters(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        storyId = "",
        isLocked,
        hasAffiliate,
        sort = "createdAt",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        ...(search && {
          title: { contains: search, mode: "insensitive" },
        }),
        ...(storyId && { storyId }),
        ...(isLocked !== undefined && { isLocked: isLocked === "true" }),
        ...(hasAffiliate === "true" && { affiliateId: { not: null } }),
        ...(hasAffiliate === "false" && { affiliateId: null }),
      };

      const orderBy = {};
      if (sort === "number") {
        orderBy.number = "asc";
      } else if (sort === "title") {
        orderBy.title = "asc";
      } else if (sort === "updatedAt") {
        orderBy.updatedAt = "desc";
      } else {
        orderBy.createdAt = "desc";
      }

      const [chapters, total] = await Promise.all([
        prisma.chapter.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy,
          include: {
            story: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
            affiliate: {
              select: {
                id: true,
                provider: true,
                targetUrl: true,
                label: true,
              },
            },
          },
        }),
        prisma.chapter.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          chapters,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get chapters error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách chương",
      });
    }
  }

  async createChapter(req, res) {
    try {
      const { storyId } = req.params;
      const { number, title, content, audioUrl, isLocked } = req.body;

      // Validation
      validationService.validateChapterData({ number, title });

      // Check if story exists
      const story = await prisma.story.findUnique({
        where: { id: storyId },
        select: { id: true, type: true },
      });

      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Truyện không tồn tại",
        });
      }

      // Check if chapter number already exists
      const existingChapter = await prisma.chapter.findUnique({
        where: {
          storyId_number: {
            storyId,
            number: parseInt(number),
          },
        },
      });

      if (existingChapter) {
        return res.status(400).json({
          error: "Conflict",
          message: "Số chương đã tồn tại",
        });
      }

      // Create chapter
      const chapter = await prisma.chapter.create({
        data: {
          number: parseInt(number),
          title: title.trim(),
          content: content?.trim() || null,
          audioUrl: audioUrl || null,
          isLocked: Boolean(isLocked),
          storyId,
        },
        include: {
          story: {
            select: {
              title: true,
              slug: true,
              type: true,
            },
          },
        },
      });

      res.status(201).json({
        message: "Tạo chương thành công",
        chapter,
      });
    } catch (error) {
      console.error("Create chapter error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
          details: error.details,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo chương",
      });
    }
  }

  async updateChapter(req, res) {
    try {
      const { id } = req.params;
      const { title, content, audioUrl, isLocked } = req.body;

      const updateData = {};

      if (title !== undefined) {
        validationService.validateChapterData({ title, number: 1 });
        updateData.title = title.trim();
      }

      if (content !== undefined) {
        updateData.content = content?.trim() || null;
      }

      if (audioUrl !== undefined) {
        updateData.audioUrl = audioUrl || null;
      }

      if (isLocked !== undefined) {
        updateData.isLocked = Boolean(isLocked);
      }

      const chapter = await prisma.chapter.update({
        where: { id },
        data: updateData,
        include: {
          story: {
            select: {
              title: true,
              slug: true,
              type: true,
            },
          },
        },
      });

      res.json({
        message: "Cập nhật chương thành công",
        chapter,
      });
    } catch (error) {
      console.error("Update chapter error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Chương không tồn tại",
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật chương",
      });
    }
  }

  async deleteChapter(req, res) {
    try {
      const { id } = req.params;

      // Check if chapter exists
      const chapter = await prisma.chapter.findUnique({
        where: { id },
        select: { id: true, title: true },
      });

      if (!chapter) {
        return res.status(404).json({
          error: "Not Found",
          message: "Chương không tồn tại",
        });
      }

      // Delete chapter
      await prisma.chapter.delete({
        where: { id },
      });

      res.json({
        message: "Xóa chương thành công",
      });
    } catch (error) {
      console.error("Delete chapter error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa chương",
      });
    }
  }

  // Manage Comments
  async getPendingComments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const comments = await prisma.comment.findMany({
        where: {
          isApproved: false,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
          chapter: {
            select: {
              title: true,
              number: true,
              story: {
                select: {
                  title: true,
                  slug: true,
                },
              },
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
          isApproved: false,
        },
      });

      res.json({
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get pending comments error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy bình luận chờ duyệt",
      });
    }
  }

  async approveComment(req, res) {
    try {
      const { id } = req.params;

      const comment = await prisma.comment.update({
        where: { id },
        data: { isApproved: true },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      res.json({
        message: "Duyệt bình luận thành công",
        comment,
      });
    } catch (error) {
      console.error("Approve comment error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Bình luận không tồn tại",
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi duyệt bình luận",
      });
    }
  }

  async rejectComment(req, res) {
    try {
      const { id } = req.params;

      await prisma.comment.delete({
        where: { id },
      });

      res.json({
        message: "Từ chối và xóa bình luận thành công",
      });
    } catch (error) {
      console.error("Reject comment error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Bình luận không tồn tại",
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi từ chối bình luận",
      });
    }
  }

  // Manage Genres
  async createGenre(req, res) {
    try {
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Tên thể loại là bắt buộc",
        });
      }

      const slug = slugify(name, { lower: true });

      // Check if genre exists
      const existingGenre = await prisma.genre.findUnique({
        where: { slug },
      });

      if (existingGenre) {
        return res.status(400).json({
          error: "Conflict",
          message: "Thể loại đã tồn tại",
        });
      }

      const genre = await prisma.genre.create({
        data: {
          name: name.trim(),
          slug,
        },
      });

      res.status(201).json({
        message: "Tạo thể loại thành công",
        genre,
      });
    } catch (error) {
      console.error("Create genre error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo thể loại",
      });
    }
  }

  async updateGenre(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Tên thể loại là bắt buộc",
        });
      }

      const slug = slugify(name, { lower: true });

      // Check if another genre with same slug exists
      const existingGenre = await prisma.genre.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (existingGenre) {
        return res.status(400).json({
          error: "Conflict",
          message: "Thể loại với tên này đã tồn tại",
        });
      }

      const genre = await prisma.genre.update({
        where: { id },
        data: {
          name: name.trim(),
          slug,
        },
      });

      res.json({
        message: "Cập nhật thể loại thành công",
        genre,
      });
    } catch (error) {
      console.error("Update genre error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Thể loại không tồn tại",
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật thể loại",
      });
    }
  }

  async deleteGenre(req, res) {
    try {
      const { id } = req.params;

      // Check if genre is used by any stories
      const storiesCount = await prisma.story.count({
        where: {
          genres: {
            some: {
              id,
            },
          },
        },
      });

      if (storiesCount > 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: `Không thể xóa thể loại đang được sử dụng bởi ${storiesCount} truyện`,
        });
      }

      await prisma.genre.delete({
        where: { id },
      });

      res.json({
        message: "Xóa thể loại thành công",
      });
    } catch (error) {
      console.error("Delete genre error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Thể loại không tồn tại",
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa thể loại",
      });
    }
  }

  // Manage Affiliate Links
  async getAffiliateLinks(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        provider = "",
        isActive,
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        ...(search && {
          OR: [
            { provider: { contains: search, mode: "insensitive" } },
            { label: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(provider && { provider }),
        ...(isActive !== undefined && { isActive: isActive === "true" }),
      };

      const [affiliateLinks, total] = await Promise.all([
        prisma.affiliateLink.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                stories: true,
                chapters: true,
              },
            },
          },
        }),
        prisma.affiliateLink.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          affiliateLinks,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get affiliate links error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách affiliate link",
      });
    }
  }

  async createAffiliateLink(req, res) {
    try {
      const { provider, targetUrl, label } = req.body;

      if (!provider || !targetUrl) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Provider và targetUrl là bắt buộc",
        });
      }

      const affiliateLink = await prisma.affiliateLink.create({
        data: {
          provider: provider.trim(),
          targetUrl: targetUrl.trim(),
          label: label?.trim() || null,
        },
      });

      res.status(201).json({
        message: "Tạo affiliate link thành công",
        affiliateLink,
      });
    } catch (error) {
      console.error("Create affiliate link error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo affiliate link",
      });
    }
  }

  async updateAffiliateLink(req, res) {
    try {
      const { id } = req.params;
      const { provider, targetUrl, label, isActive } = req.body;

      const updateData = {};

      if (provider !== undefined) {
        updateData.provider = provider.trim();
      }

      if (targetUrl !== undefined) {
        updateData.targetUrl = targetUrl.trim();
      }

      if (label !== undefined) {
        updateData.label = label?.trim() || null;
      }

      if (isActive !== undefined) {
        updateData.isActive = Boolean(isActive);
      }

      const affiliateLink = await prisma.affiliateLink.update({
        where: { id },
        data: updateData,
      });

      res.json({
        message: "Cập nhật affiliate link thành công",
        affiliateLink,
      });
    } catch (error) {
      console.error("Update affiliate link error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Affiliate link không tồn tại",
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật affiliate link",
      });
    }
  }

  async deleteAffiliateLink(req, res) {
    try {
      const { id } = req.params;

      await prisma.affiliateLink.delete({
        where: { id },
      });

      res.json({
        message: "Xóa affiliate link thành công",
      });
    } catch (error) {
      console.error("Delete affiliate link error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Affiliate link không tồn tại",
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa affiliate link",
      });
    }
  }

  // Sample data creation for development
  async createSampleData(req, res) {
    try {
      // Create sample genres
      const genres = await Promise.all([
        prisma.genre.upsert({
          where: { slug: "tien-hiep" },
          update: {},
          create: {
            name: "Tiên Hiệp",
            slug: "tien-hiep",
          },
        }),
        prisma.genre.upsert({
          where: { slug: "huyen-huyen" },
          update: {},
          create: {
            name: "Huyền Huyễn",
            slug: "huyen-huyen",
          },
        }),
        prisma.genre.upsert({
          where: { slug: "do-thi" },
          update: {},
          create: {
            name: "Đô Thị",
            slug: "do-thi",
          },
        }),
        prisma.genre.upsert({
          where: { slug: "ngon-tinh" },
          update: {},
          create: {
            name: "Ngôn Tình",
            slug: "ngon-tinh",
          },
        }),
      ]);

      // Sample stories data
      const sampleStories = [
        {
          title: "Đấu Phá Thương Khung",
          slug: "dau-pha-thuong-khung",
          description:
            "Đây là một thế giới thuộc về Đấu Khí, không hề có ma pháp hoa tiếu diệm lệ, chỉ có đấu khí cương mãnh phồn thịnh! Tại đây, muốn trở thành nhà cường giả hơn người, phải tu luyện...",
          thumbnailUrl:
            "https://img.dtruyen.com/uploads/images/dau-pha-thuong-khung.jpg",
          type: "TEXT",
          status: "PUBLISHED",
          viewCount: 15420,
          genres: [0, 1], // Will be replaced with actual IDs
        },
        {
          title: "Tu La Võ Thần",
          slug: "tu-la-vo-than",
          description:
            "Tiếc thay thiên địa chi gian tu la chi đạo, nhị thập niên tiền nhất trường đại chiến, tu la môn diệt, từ đó thần châu đại địa tái vô tu la...",
          thumbnailUrl:
            "https://img.dtruyen.com/uploads/images/tu-la-vo-than.jpg",
          type: "AUDIO",
          status: "PUBLISHED",
          viewCount: 8930,
          genres: [0],
        },
        {
          title: "Ngạo Thế Cửu Trùng Thiên",
          slug: "ngao-the-cuu-trung-thien",
          description:
            "Cười ngạo giang hồ, ai địch được ta? Thiên địa vô cực, ta tâm vô biên! Tỷ kiếm tại tay, vấn thiên hạ anh hùng ai là địch thủ?",
          thumbnailUrl:
            "https://img.dtruyen.com/uploads/images/ngao-the-cuu-trung-thien.jpg",
          type: "TEXT",
          status: "PUBLISHED",
          viewCount: 12560,
          genres: [0, 1],
        },
        {
          title: "Thần Y Độc Phi",
          slug: "than-y-doc-phi",
          description:
            "Cô là thiên tài y học của thế kỷ 21, nhất đại độc nữ vương, một khi xuyên qua trở thành tướng phủ cô nữ...",
          thumbnailUrl:
            "https://img.dtruyen.com/uploads/images/than-y-doc-phi.jpg",
          type: "TEXT",
          status: "PUBLISHED",
          viewCount: 9870,
          genres: [3],
        },
        {
          title: "Audio: Bách Luyện Thành Thần",
          slug: "audio-bach-luyen-thanh-than",
          description:
            "Thiếu niên mang theo lò luyện đan dược cổ xưa và tiểu long nữ bé bỏng phiêu lưu đại lục. Bách luyện thành thần, bách chiến thành vương!",
          thumbnailUrl:
            "https://img.dtruyen.com/uploads/images/bach-luyen-thanh-than.jpg",
          type: "AUDIO",
          status: "PUBLISHED",
          viewCount: 11230,
          genres: [0, 1],
        },
      ];

      // Create sample user/author
      const sampleAuthor = await prisma.user.upsert({
        where: { email: "author@example.com" },
        update: {},
        create: {
          email: "author@example.com",
          name: "Tác Giả Mẫu",
          password: "$2b$12$dummy.hash.for.sample.author",
          role: "USER",
        },
      });

      // Create stories
      const createdStories = [];
      for (const storyData of sampleStories) {
        const story = await prisma.story.upsert({
          where: { slug: storyData.slug },
          update: {
            title: storyData.title,
            description: storyData.description,
            thumbnailUrl: storyData.thumbnailUrl,
            viewCount: storyData.viewCount,
          },
          create: {
            title: storyData.title,
            slug: storyData.slug,
            description: storyData.description,
            thumbnailUrl: storyData.thumbnailUrl,
            type: storyData.type,
            status: storyData.status,
            viewCount: storyData.viewCount,
            authorId: sampleAuthor.id,
          },
        });

        // Connect genres
        await prisma.story.update({
          where: { id: story.id },
          data: {
            genres: {
              connect: storyData.genres.map((index) => ({
                id: genres[index].id,
              })),
            },
          },
        });

        createdStories.push(story);
      }

      // Create sample chapters for each story
      for (const story of createdStories) {
        const chapterCount = Math.floor(Math.random() * 20) + 5;

        for (let i = 1; i <= chapterCount; i++) {
          const chapterData = {
            number: i,
            title: `Chương ${i}: ${this.generateChapterTitle()}`,
            storyId: story.id,
            isLocked: i > 3,
          };

          if (story.type === "TEXT") {
            chapterData.content = this.generateSampleTextContent(
              story.title,
              i
            );
          } else if (story.type === "AUDIO") {
            chapterData.audioUrl = `https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3`;
            chapterData.content = this.generateSampleTextContent(
              story.title,
              i
            );
          }

          await prisma.chapter.upsert({
            where: {
              storyId_number: {
                storyId: story.id,
                number: i,
              },
            },
            update: chapterData,
            create: chapterData,
          });
        }
      }

      res.json({
        message: "Đã tạo dữ liệu mẫu thành công",
        data: {
          genres: genres.length,
          stories: createdStories.length,
          chaptersPerStory: "5-25 chương",
        },
      });
    } catch (error) {
      console.error("Create sample data error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo dữ liệu mẫu",
      });
    }
  }

  generateChapterTitle() {
    const titles = [
      "Khởi đầu hành trình",
      "Gặp gỡ sư phụ",
      "Bước đầu tu luyện",
      "Thử thách đầu tiên",
      "Đột phá cảnh giới",
      "Gặp gỡ người bạn",
      "Kẻ thù xuất hiện",
      "Cuộc chiến sinh tử",
      "Nhận được bảo vật",
      "Phát hiện bí mật",
      "Rời khỏi quê hương",
      "Bước vào tông môn",
      "Thi đấu nội môn",
      "Nhiệm vụ khó khăn",
      "Nguy hiểm rình rập",
      "Cứu người trong nguy",
      "Báo thù ân oán",
      "Tình duyên đầu đời",
      "Chia ly đau khổ",
      "Trở về mạnh mẽ",
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateSampleTextContent(storyTitle, chapterNumber) {
    const sampleParagraphs = [
      "Trời đang dần tối, mây đen giăng phủ khắp bầu trời. Gió lạnh thổi qua, mang theo hương vị của một cơn mưa sắp đến.",
      "Trong căn phòng nhỏ, ánh sáng đèn dầu le lói tạo ra những bóng đen dài trên tường. Không khí tĩnh lặng đến kỳ lạ.",
      "Tiếng bước chân vang vọng trong hành lang dài, từng bước một, chậm rãi và đều đặn. Ai đó đang tiến đến gần.",
      "Anh ta ngước nhìn lên bầu trời đầy sao, trong lòng dâng lên biết bao cảm xúc. Quá khứ như ùa về trong từng kỷ niệm.",
      "Cô gái trẻ đứng bên cửa sổ, mắt nhìn ra xa xăm. Ngoài kia, thành phố đang dần thức giấc trong ánh bình minh.",
      "Trong khu rừng sâu, tiếng lá khô xào xạc dưới chân. Những tia nắng le lói xuyên qua tán lá tạo nên khung cảnh huyền ảo.",
      "Căn phòng rộng lớn với những giá sách cao vút. Mùi giấy cũ và mực khô tạo nên một không gian yên bình, thích hợp cho việc đọc sách.",
      "Tiếng chuông từ xa vang lên, báo hiệu một ngày mới bắt đầu. Cuộc sống lại tiếp tục với những kỳ vọng và hy vọng mới.",
    ];

    const content = [];
    const paragraphCount = Math.floor(Math.random() * 8) + 5;

    for (let i = 0; i < paragraphCount; i++) {
      content.push(
        sampleParagraphs[Math.floor(Math.random() * sampleParagraphs.length)]
      );
    }

    return `# ${storyTitle} - Chương ${chapterNumber}\n\n${content.join(
      "\n\n"
    )}\n\n*Tiếp tục đọc để khám phá những diễn biến hấp dẫn tiếp theo...*`;
  }

  async getAnalytics(req, res) {
    try {
      const { period = "7d" } = req.query;

      let dateFilter;
      switch (period) {
        case "1d":
          dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      const [userGrowth, storyGrowth, topStories, recentComments] =
        await Promise.all([
          prisma.user.count({ where: { createdAt: { gte: dateFilter } } }),
          prisma.story.count({ where: { createdAt: { gte: dateFilter } } }),
          prisma.story.findMany({
            take: 10,
            orderBy: { viewCount: "desc" },
            include: {
              author: { select: { name: true } },
              affiliate: {
                select: {
                  id: true,
                  provider: true,
                  targetUrl: true,
                  label: true,
                  isActive: true,
                },
              },
              _count: { select: { chapters: true, bookmarks: true } },
            },
          }),
          prisma.comment.count({ where: { createdAt: { gte: dateFilter } } }),
        ]);

      res.json({
        period,
        data: {
          growth: {
            users: userGrowth,
            stories: storyGrowth,
            comments: recentComments,
          },
          topStories,
          systemHealth: {
            totalStorage: "2.5GB",
            activeUsers: await prisma.user.count({ where: { role: "USER" } }),
            serverUptime: "99.9%",
            responseTime: "150ms",
          },
        },
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy dữ liệu phân tích",
      });
    }
  }
}

module.exports = new AdminController();

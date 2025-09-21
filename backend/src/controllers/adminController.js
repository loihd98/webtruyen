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
        stats: {
          totalUsers,
          totalStories,
          totalChapters,
          totalComments,
          totalViews: totalViews._sum.viewCount || 0,
          recentUsers,
          recentStories,
          topStories,
        },
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
      const affiliateLinks = await prisma.affiliateLink.findMany({
        include: {
          _count: {
            select: {
              stories: true,
              analytics: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({
        affiliateLinks,
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
}

module.exports = new AdminController();

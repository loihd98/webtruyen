const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class AffiliateController {
  // GET /api/affiliate - Get all affiliate links with search and pagination
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
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching affiliate links:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch affiliate links",
      });
    }
  }

  // GET /api/affiliate/:id - Get single affiliate link
  async getAffiliateLinkById(req, res) {
    try {
      const { id } = req.params;

      const affiliateLink = await prisma.affiliateLink.findUnique({
        where: { id },
        include: {
          stories: {
            select: { id: true, title: true, slug: true },
          },
          chapters: {
            select: {
              id: true,
              title: true,
              number: true,
              story: { select: { title: true } },
            },
          },
        },
      });

      if (!affiliateLink) {
        return res.status(404).json({
          success: false,
          message: "Affiliate link not found",
        });
      }

      res.json({
        success: true,
        data: affiliateLink,
      });
    } catch (error) {
      console.error("Error fetching affiliate link:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch affiliate link",
      });
    }
  }

  // GET /api/affiliate/public/active - Get active affiliate links (public endpoint)
  async getPublicAffiliateLinks(req, res) {
    try {
      const { limit = 10 } = req.query;

      const affiliateLinks = await prisma.affiliateLink.findMany({
        where: { isActive: true },
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          provider: true,
          targetUrl: true,
          label: true,
          isActive: true,
        },
      });

      res.json({
        success: true,
        data: affiliateLinks,
      });
    } catch (error) {
      console.error("Error fetching public affiliate links:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch affiliate links",
      });
    }
  }

  // POST /api/affiliate - Create new affiliate link
  async createAffiliateLink(req, res) {
    try {
      const {
        provider,
        targetUrl,
        label,
        description,
        isActive = true,
      } = req.body;

      if (!provider || !targetUrl) {
        return res.status(400).json({
          success: false,
          message: "Provider and target URL are required",
        });
      }

      const affiliateLink = await prisma.affiliateLink.create({
        data: {
          provider,
          targetUrl,
          label,
          description,
          isActive,
        },
      });

      res.status(201).json({
        success: true,
        data: affiliateLink,
        message: "Affiliate link created successfully",
      });
    } catch (error) {
      console.error("Error creating affiliate link:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create affiliate link",
      });
    }
  }

  // PUT /api/affiliate/:id - Update affiliate link
  async updateAffiliateLink(req, res) {
    try {
      const { id } = req.params;
      const { provider, targetUrl, label, description, isActive } = req.body;

      const existingAffiliateLink = await prisma.affiliateLink.findUnique({
        where: { id },
      });

      if (!existingAffiliateLink) {
        return res.status(404).json({
          success: false,
          message: "Affiliate link not found",
        });
      }

      const affiliateLink = await prisma.affiliateLink.update({
        where: { id },
        data: {
          ...(provider && { provider }),
          ...(targetUrl && { targetUrl }),
          ...(label !== undefined && { label }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: affiliateLink,
        message: "Affiliate link updated successfully",
      });
    } catch (error) {
      console.error("Error updating affiliate link:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update affiliate link",
      });
    }
  }

  // DELETE /api/affiliate/:id - Delete affiliate link
  async deleteAffiliateLink(req, res) {
    try {
      const { id } = req.params;

      const existingAffiliateLink = await prisma.affiliateLink.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              stories: true,
              chapters: true,
            },
          },
        },
      });

      if (!existingAffiliateLink) {
        return res.status(404).json({
          success: false,
          message: "Affiliate link not found",
        });
      }

      // Check if affiliate link is being used
      const usageCount =
        existingAffiliateLink._count.stories +
        existingAffiliateLink._count.chapters;
      if (usageCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete affiliate link. It's being used by ${usageCount} item(s).`,
        });
      }

      await prisma.affiliateLink.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: "Affiliate link deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting affiliate link:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete affiliate link",
      });
    }
  }

  // GET /api/affiliate/search - Search affiliate links for select dropdown
  async searchAffiliateLinks(req, res) {
    try {
      const { q = "", limit = 20 } = req.query;

      const affiliateLinks = await prisma.affiliateLink.findMany({
        where: {
          isActive: true,
          OR: [
            { provider: { contains: q, mode: "insensitive" } },
            { label: { contains: q, mode: "insensitive" } },
          ],
        },
        take: parseInt(limit),
        orderBy: { provider: "asc" },
        select: {
          id: true,
          provider: true,
          label: true,
          targetUrl: true,
        },
      });

      res.json({
        success: true,
        data: affiliateLinks,
      });
    } catch (error) {
      console.error("Error searching affiliate links:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search affiliate links",
      });
    }
  }
  // Handle affiliate link redirect and analytics
  async redirectAffiliate(req, res) {
    try {
      const { affiliateId } = req.params;
      const { storyId, chapterId } = req.query;

      // Get affiliate link
      const affiliate = await prisma.affiliateLink.findUnique({
        where: { id: affiliateId },
      });

      if (!affiliate) {
        return res.status(404).json({
          error: "Not Found",
          message: "Liên kết không tồn tại",
        });
      }

      if (!affiliate.isActive) {
        return res.status(410).json({
          error: "Gone",
          message: "Liên kết đã bị vô hiệu hóa",
        });
      }

      // Extract user info from token if present
      let userId = null;
      try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
          const token = authHeader.split(" ")[1];
          if (token) {
            const tokenService = require("../utils/tokenService");
            const decoded = tokenService.verifyAccessToken(token);
            userId = decoded.userId;
          }
        }
      } catch (error) {
        // Invalid token, continue as anonymous user
      }

      // Log analytics
      await prisma.analytics.create({
        data: {
          event: "affiliate_click",
          userId,
          storyId: storyId || null,
          affiliateId,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          referer: req.get("Referer"),
        },
      });

      // If chapter unlock is involved, handle it
      if (chapterId) {
        try {
          const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
          });

          if (chapter && chapter.isLocked && userId) {
            // Check if already unlocked
            const existingUnlock = await prisma.chapter.findFirst({
              where: {
                id: chapterId,
                unlockedBy: {
                  some: {
                    id: userId,
                  },
                },
              },
            });

            if (!existingUnlock) {
              // Unlock chapter for user
              await prisma.chapter.update({
                where: { id: chapterId },
                data: {
                  unlockedBy: {
                    connect: {
                      id: userId,
                    },
                  },
                },
              });

              // Log chapter unlock analytics
              await prisma.analytics.create({
                data: {
                  event: "chapter_unlock",
                  userId,
                  storyId: chapter.storyId,
                  affiliateId,
                  ip: req.ip || req.connection.remoteAddress,
                  userAgent: req.get("User-Agent"),
                },
              });
            }
          }
        } catch (error) {
          console.error("Chapter unlock error:", error);
          // Continue with redirect even if unlock fails
        }
      }

      // Redirect to affiliate URL
      res.redirect(302, affiliate.targetUrl);
    } catch (error) {
      console.error("Affiliate redirect error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xử lý liên kết",
      });
    }
  }

  // Get analytics data for affiliate links (admin only)
  async getAffiliateAnalytics(req, res) {
    try {
      const { affiliateId } = req.params;
      const { startDate, endDate, limit = 100 } = req.query;

      const where = {
        event: "affiliate_click",
      };

      if (affiliateId) {
        where.affiliateId = affiliateId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // Get click analytics
      const analytics = await prisma.analytics.findMany({
        where,
        include: {
          affiliate: {
            select: {
              provider: true,
              label: true,
            },
          },
          story: {
            select: {
              title: true,
              slug: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: parseInt(limit),
      });

      // Get summary stats
      const totalClicks = await prisma.analytics.count({ where });

      const uniqueUsers = await prisma.analytics.groupBy({
        by: ["userId"],
        where: {
          ...where,
          userId: {
            not: null,
          },
        },
      });

      const clicksByAffiliate = await prisma.analytics.groupBy({
        by: ["affiliateId"],
        where,
        _count: {
          id: true,
        },
      });

      res.json({
        analytics,
        summary: {
          totalClicks,
          uniqueUsers: uniqueUsers.length,
          clicksByAffiliate,
        },
      });
    } catch (error) {
      console.error("Get affiliate analytics error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy thống kê",
      });
    }
  }
}

module.exports = new AffiliateController();

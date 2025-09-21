const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class AffiliateController {
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

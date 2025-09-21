const { PrismaClient } = require("@prisma/client");
const tokenService = require("../utils/tokenService");

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token không được cung cấp",
      });
    }

    const decoded = tokenService.verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Người dùng không tồn tại",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Token không hợp lệ",
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Vui lòng đăng nhập",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Forbidden",
      message: "Bạn không có quyền truy cập tính năng này",
    });
  }

  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = tokenService.verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
          },
        });

        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
};

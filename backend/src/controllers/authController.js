const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const tokenService = require("../utils/tokenService");
const validationService = require("../utils/validationService");

const prisma = new PrismaClient();

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validation
      validationService.validateEmail(email);
      validationService.validatePassword(password);
      validationService.validateName(name);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return res.status(400).json({
          error: "Conflict",
          message: "Email này đã được sử dụng",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name: name.trim(),
          role: "USER",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const tokens = tokenService.generateTokenPair(user);

      // Format user response with all required fields
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        googleId: null,
        facebookId: null,
        createdAt: user.createdAt,
        updatedAt: user.createdAt, // Same as createdAt for new user
      };

      res.status(201).json({
        message: "Đăng ký thành công",
        data: {
          user: userResponse,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }
      });
    } catch (error) {
      console.error("Register error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi đăng ký",
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      validationService.validateEmail(email);
      validationService.validatePassword(password);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user || !user.passwordHash) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // Generate tokens
      const tokens = tokenService.generateTokenPair(user);

      // Return user data without password, including all fields
      const { passwordHash, ...userWithoutPassword } = user;

      // Ensure we have all required fields with proper formatting
      const userResponse = {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        avatar: userWithoutPassword.avatar,
        role: userWithoutPassword.role,
        googleId: userWithoutPassword.googleId,
        facebookId: userWithoutPassword.facebookId,
        createdAt: userWithoutPassword.createdAt,
        updatedAt: userWithoutPassword.updatedAt,
      };

      res.json({
        message: "Đăng nhập thành công",
        data: {
          user: userResponse,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }
      });
    } catch (error) {
      console.error("Login error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi đăng nhập",
      });
    }
  }

  // Refresh token
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Refresh token là bắt buộc",
        });
      }

      // Verify refresh token
      const decoded = tokenService.verifyRefreshToken(refreshToken);

      // Get user
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

      // Generate new tokens
      const tokens = tokenService.generateTokenPair(user);

      // Format user response with all required fields
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        googleId: user.googleId || null,
        facebookId: user.facebookId || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || user.createdAt,
      };

      res.json({
        message: "Token đã được làm mới",
        data: {
          user: userResponse,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      console.error("Refresh token error:", error);

      res.status(401).json({
        error: "Unauthorized",
        message: "Refresh token không hợp lệ",
      });
    }
  }

  // Get current user profile
  async me(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              bookmarks: true,
              comments: true,
              stories: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          error: "Not Found",
          message: "Người dùng không tồn tại",
        });
      }

      res.json({
        user,
      });
    } catch (error) {
      console.error("Get profile error:", error);

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy thông tin người dùng",
      });
    }
  }

  // Handle OAuth success
  async oauthSuccess(req, res) {
    try {
      const user = req.user;

      // Generate tokens
      const tokens = tokenService.generateTokenPair(user);

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.CORS_ORIGIN}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth success error:", error);
      res.redirect(`${process.env.CORS_ORIGIN}/auth/error`);
    }
  }

  // Handle OAuth failure
  async oauthFailure(req, res) {
    res.redirect(
      `${process.env.CORS_ORIGIN}/auth/error?message=OAuth authentication failed`
    );
  }

  // Logout (client-side token removal)
  async logout(req, res) {
    res.json({
      message: "Đăng xuất thành công",
    });
  }
}

module.exports = new AuthController();

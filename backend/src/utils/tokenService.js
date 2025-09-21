const jwt = require("jsonwebtoken");
const config = require("../config");

class TokenService {
  generateAccessToken(payload) {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn,
    });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwtRefreshSecret);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }
}

module.exports = new TokenService();

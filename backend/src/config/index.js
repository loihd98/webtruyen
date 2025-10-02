require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: "15m",
  jwtRefreshExpiresIn: "7d",

  // OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  },

  // Upload
  uploadPath: process.env.UPLOAD_PATH || "./uploads",
  maxFileSize: 100 * 1024 * 1024, // 100MB

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // Base URL
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
};

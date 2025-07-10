import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000"),
  HOST: process.env.HOST || "localhost",

  // Database Configuration
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/event_service_db",

  // JWT Configuration
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "default-secret-key",
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh-secret-key",
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",

  // Client URL
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  // Rate Limiting Configuration
  RATE_LIMIT: {
    WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15 minutes
    MAX: parseInt(process.env.RATE_LIMIT_MAX || "100"), // 100 requests per window
  },
};

// Re-export swagger config
export { swaggerSpec } from "./swagger";

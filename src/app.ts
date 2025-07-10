import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";

import { config } from "./config";
import { swaggerSpec } from "./config/swagger";
import { logger } from "./utils/logger";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/error.middleware";

// Import your routes here
import {
  authRouter,
  fuelPriceRouter,
  fuelAnalysisRouter,
  retailDataRouter,
  systemRouter,
} from "./routes";

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

export const app: Application = express();

// Basic middlewares - order matters!
app.use(cors({ origin: config.CORS_ORIGIN }));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// ===== ROUTES SECTION - Define all routes here =====

// System routes (health checks, API info, etc.)
app.use("/", systemRouter);

// ===== SWAGGER DOCUMENTATION =====
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "NOEMDEK Fuel Metrics API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  })
);

// ===== API ROUTES =====
app.use("/api/auth", authRouter);
app.use("/api/fuel", fuelPriceRouter);
app.use("/api/fuel-analysis", fuelAnalysisRouter);
app.use("/api/retail-data", retailDataRouter);

// ===== END ROUTES SECTION =====

// 404 handler for unmatched routes - MUST be last before error handler
app.use((req: Request, res: Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      root: "GET /",
      health: "GET /health",
      detailedHealth: "GET /health/detailed",
      apiInfo: "GET /api/info",
      docs: "GET /api-docs",
    },
  });
});

// Global Error Handling Middleware - MUST be absolute last
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start the server
    const server = app.listen(config.PORT, config.HOST, () => {
      logger.info([
        "🚀 Server started successfully!",
        `Environment: ${config.NODE_ENV}`,
        `Host: ${config.HOST}`,
        `Port: ${config.PORT}`,
        `Database: ${config.MONGODB_URI}`,
        `Started at: ${new Date().toLocaleString()}`,
        `API Root: http://${config.HOST}:${config.PORT}/`,
        `API Docs: http://${config.HOST}:${config.PORT}/api-docs`,
      ]);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection:", { reason, promise });
  process.exit(1);
});

startServer();

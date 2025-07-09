import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { config } from "./config";
import { logger } from "./utils/logger";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/error.middleware";

// Import your routes here
import authRouter from "./routes/auth.routes";
import fuelPriceRouter from "./routes/fuel.price.routes";
import fuelAnalysisRouter from "./routes/fuel.analysis.routes";

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

// Root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express API is running!",
    version: "1.0.0",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Health Check
app.get("/health", (req: Request, res: Response) => {
  const healthData = {
    status: "OK",
    environment: config.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };

  res.status(200).json(healthData);
});

// Detailed health check with dependencies
app.get("/health/detailed", async (req: Request, res: Response) => {
  try {
    const healthData = {
      status: "OK",
      environment: config.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      dependencies: {
        mongodb: "connected",
      },
    };

    res.status(200).json(healthData);
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      status: "error",
      message: "Service unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// API Info route
app.get("/api-info", (req: Request, res: Response) => {
  res.status(200).json({
    name: "NOEMDEK Technical Interview",
    version: "1.0.0",
    description: "This is an API for the NOEMDEK technical interview.",
    endpoints: {
      app: "/",
      health: "/health",
      detailedHealth: "/health/detailed",
      docs: "/api-docs",
      info: "/api-info",
    },
  });
});

// ===== API DOCUMENTATION ROUTE =====
app.use("/api/auth", authRouter);
app.use("/api/fuel", fuelPriceRouter);
app.use("/api/fuel-analysis", fuelAnalysisRouter);

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
      logger.info(
        [
          "🚀 Server started successfully!",
          `Environment: ${config.NODE_ENV}`,
          `Host: ${config.HOST}`,
          `Port: ${config.PORT}`,
          `Database: ${config.MONGODB_URI}`,
          `Started at: ${new Date().toLocaleString()}`,
          `API Root: http://${config.HOST}:${config.PORT}/`,
          `API Docs: http://${config.HOST}:${config.PORT}/api-docs`,
        ].join("\n")
      );
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

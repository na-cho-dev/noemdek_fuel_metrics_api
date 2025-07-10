/**
 * @fileoverview Test Application Setup
 * @description Creates an Express app instance for testing without starting a server
 */

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { config } from "../config";
import { logger } from "../utils/logger";
import { errorHandler } from "../middleware/error.middleware";

// Import your routes here
import authRouter from "../routes/auth.routes";
import fuelPriceRouter from "../routes/fuel.price.routes";
import fuelAnalysisRouter from "../routes/fuel.analysis.routes";
import retailDataRouter from "../routes/retail-data.routes";

// Create test app without starting server
export const createTestApp = (): Application => {
  const app: Application = express();

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

  // Use a simpler logger for tests
  app.use(morgan("tiny"));

  // Request logging middleware (simplified for tests)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip logging in tests
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

  // ===== API ROUTES =====
  app.use("/api/auth", authRouter);
  app.use("/api/fuel", fuelPriceRouter);
  app.use("/api/fuel-analysis", fuelAnalysisRouter);
  app.use("/api/retail-data", retailDataRouter);

  // ===== END ROUTES SECTION =====

  // 404 handler for unmatched routes - MUST be last before error handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: "Not Found",
      message: `Cannot ${req.method} ${req.originalUrl}`,
      availableEndpoints: {
        root: "GET /",
        health: "GET /health",
        detailedHealth: "GET /health/detailed",
        apiInfo: "GET /api-info",
        docs: "GET /api-docs",
      },
    });
  });

  // Global Error Handling Middleware - MUST be absolute last
  app.use(errorHandler);

  return app;
};

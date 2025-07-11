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
import { errorHandler } from "../middleware/error.middleware";

// Import your routes here - use the same structure as main app
import {
  authRouter,
  fuelPriceRouter,
  fuelAnalysisRouter,
  retailDataRouter,
  systemRouter,
} from "../routes";

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

  // System routes (health checks, API info, etc.) - same as main app
  app.use("/", systemRouter);

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
      "available-endpoints": {
        root: "GET /",
        health: "GET /health",
        docs: "GET /api-docs",
      },
    });
  });

  // Global Error Handling Middleware - MUST be absolute last
  app.use(errorHandler);

  return app;
};

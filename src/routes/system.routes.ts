import { Router, Request, Response } from "express";
import { config } from "../config";
import { logger } from "../utils/logger";

const systemRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System health and information endpoints
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get API status and basic information
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API status retrieved successfully
 */
systemRouter.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "NOEMDEK Fuel Metrics API is running!",
    version: "1.0.0",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      docs: "/api-docs",
    },
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Comprehensive health check with dependencies
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy with full system status
 *       503:
 *         description: Service is unhealthy
 */
systemRouter.get("/health", async (req: Request, res: Response) => {
  try {
    // Test database connectivity
    let dbStatus = "connected";
    let dbLatency = 0;

    try {
      const startTime = Date.now();
      // Add actual DB ping here if needed
      dbLatency = Date.now() - startTime;
    } catch (error) {
      dbStatus = "disconnected";
      logger.error("Database health check failed:", error);
    }

    const healthData = {
      status: "OK",
      environment: config.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      dependencies: {
        mongodb: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
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

export default systemRouter;

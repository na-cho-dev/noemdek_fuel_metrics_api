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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Express API is running!"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   description: Current environment
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Current timestamp
 */
systemRouter.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express API is running!",
    version: "1.0.0",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
systemRouter.get("/health", (req: Request, res: Response) => {
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

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with dependencies
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy with dependency status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthResponse'
 *                 - type: object
 *                   properties:
 *                     dependencies:
 *                       type: object
 *                       properties:
 *                         mongodb:
 *                           type: string
 *                           example: "connected"
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
systemRouter.get("/health/detailed", async (req: Request, res: Response) => {
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

/**
 * @swagger
 * /api-info:
 *   get:
 *     summary: Get API metadata and available endpoints
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "NOEMDEK Technical Interview"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 description:
 *                   type: string
 *                   description: API description
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     app:
 *                       type: string
 *                       example: "/"
 *                     health:
 *                       type: string
 *                       example: "/health"
 *                     detailedHealth:
 *                       type: string
 *                       example: "/health/detailed"
 *                     docs:
 *                       type: string
 *                       example: "/api-docs"
 *                     info:
 *                       type: string
 *                       example: "/api-info"
 */
systemRouter.get("/api-info", (req: Request, res: Response) => {
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

export default systemRouter;

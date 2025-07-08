import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../errors/AppError";
import { config } from "../config";

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error on ${req.method} ${req.url}:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle known operational errors
  if (err instanceof AppError || err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      code: err.name || "OPERATIONAL_ERROR",
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
      code: "TOKEN_EXPIRED",
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    });
    return;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: err.message,
      code: "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    });
    return;
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
      code: "DUPLICATE_FIELD",
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    });
    return;
  }

  // Handle unknown errors
  const isDevelopment = config.NODE_ENV === "development";

  res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    code: "INTERNAL_ERROR",
    ...(isDevelopment && {
      stack: err.stack,
      details: err,
    }),
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  });
};

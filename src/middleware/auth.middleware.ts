import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { AppError } from "../errors/AppError";
import { config } from "../config";

interface JWTPayload {
  userId: string;
  email: string;
  organizerId: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

class AuthMiddleware {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = config.JWT.SECRET;
    if (!this.jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
  }

  /**
   * Simple JWT verification
   */
  private async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Token has expired", 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid token", 401);
      }
      throw new AppError("Token verification failed", 401);
    }
  }

  /**
   * Main authentication middleware
   */
  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError("No token provided", 401);
      }

      const token = authHeader.substring(7);

      if (!token) {
        throw new AppError("No token provided", 401);
      }

      // Verify token
      const payload = await this.verifyToken(token);

      // Create user data from JWT payload
      const userData = {
        userId: payload.userId,
        email: payload.email,
        organizerId: payload.organizerId,
        role: payload.role,
        permissions: payload.permissions || [],
      };

      // Attach user to request
      req.user = userData;
      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: "AUTH_ERROR",
        });
      } else {
        logger.error("Authentication middleware error", { error });
        res.status(500).json({
          success: false,
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        });
      }
    }
  };

  /**
   * Role-based authorization middleware factory
   */
  authorize = (
    allowedRoles: string[] = [],
    requiredPermissions: string[] = []
  ) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          throw new AppError("Authentication required", 401);
        }

        // Check role authorization
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
          throw new AppError("Insufficient permissions", 403);
        }

        // Check specific permissions
        if (requiredPermissions.length > 0) {
          const hasAllPermissions = requiredPermissions.every(
            (permission) =>
              req.user &&
              Array.isArray(req.user.permissions) &&
              req.user.permissions.includes(permission)
          );

          if (!hasAllPermissions) {
            throw new AppError("Insufficient permissions", 403);
          }
        }

        next();
      } catch (error) {
        if (error instanceof AppError) {
          res.status(error.statusCode).json({
            success: false,
            message: error.message,
            code: "AUTH_ERROR",
          });
        } else {
          logger.error("Authorization middleware error", { error });
          res.status(500).json({
            success: false,
            message: "Internal server error",
            code: "INTERNAL_ERROR",
          });
        }
      }
    };
  };

  /**
   * Optional authentication middleware
   * Authenticates user if token is present but doesn't fail if no token
   */
  optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return next();
      }

      const token = authHeader.substring(7);

      if (!token) {
        return next();
      }

      const payload = await this.verifyToken(token);

      const userData = {
        userId: payload.userId,
        email: payload.email,
        organizerId: payload.organizerId,
        role: payload.role,
        permissions: payload.permissions || [],
      };

      req.user = userData;
      next();
    } catch (error) {
      // For optional auth, we don't fail on auth errors
      logger.debug("Optional auth failed, continuing without user", { error });
      next();
    }
  };
}

export default AuthMiddleware;

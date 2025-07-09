import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../errors/AppError";
import { config } from "../config";
import { verifyToken } from "../utils/jwt";
import { RolePermissions, Roles } from "../config/roles";
import UserService from "../services/user.service";

class AuthMiddleware {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = config.JWT.ACCESS_SECRET;
    if (!this.jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
  }

  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer "))
        throw new AppError("No token provided", 401);

      const token = authHeader.substring(7);

      const payload = verifyToken(token);

      // logger.info("Token verified successfully", payload);

      const user = await UserService.findById(payload.userId);
      if (!user)
        throw new AppError(
          "Invalid authentication credentials - User no longer exists",
          401
        );

      req.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        // optionally: permissions, status, etc.
      };

      next();
    } catch (error) {
      const statusCode =
        error instanceof AppError
          ? error.statusCode
          : (error as any).statusCode || 500;

      const errorName = error instanceof Error ? error.name : "UnknownError";
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";

      logger.error("Authentication middleware error", {
        error,
        timestamp: new Date().toLocaleString(),
      });

      res.status(statusCode).json({
        success: false,
        message: message,
        code: errorName,
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
    }
  };

  authorize = (
    allowedRoles: Roles[] = [],
    requiredPermissions: string[] = []
  ) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const user = req.user;
        if (!user) throw new AppError("Authentication required", 401);

        // Check roles
        if (
          allowedRoles.length &&
          (!user.role || !allowedRoles.includes(user.role as Roles))
        ) {
          throw new AppError("Access denied. Role not allowed", 403);
        }

        // Check permissions
        const userPermissions = RolePermissions[user.role as Roles] || [];
        const hasPermissions = requiredPermissions.every((perm) =>
          userPermissions.includes(perm)
        );

        if (requiredPermissions.length && !hasPermissions) {
          throw new AppError("Access denied. Missing permissions", 403);
        }

        next();
      } catch (error) {
        const statusCode =
          error instanceof AppError && error.statusCode
            ? error.statusCode
            : 500;
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Access error";
        res.status(statusCode).json({
          success: false,
          message,
        });
      }
    };
  };
}

export default AuthMiddleware;

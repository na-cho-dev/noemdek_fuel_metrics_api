import { Request, Response, NextFunction } from "express";
import { LoginSchema, RegisterSchema } from "../validation/auth.schema";
import { AppError } from "../errors/AppError";
import { AuthService } from "../services";

export class AuthController {
  /**
   * Registers a new user and returns access and refresh tokens.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = RegisterSchema.parse(req.body);
      const { user, tokens } = await AuthService.registerUser(parsed);

      res.status(201).json({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs in a user and returns access and refresh tokens.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = LoginSchema.parse(req.body);
      const { user, tokens } = await AuthService.loginUser(parsed);

      if (!user) throw new AppError("User not found", 404);

      res.json({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns the current authenticated user.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async currentUser(req: Request, res: Response) {
    res.json({ user: req.user });
  }

  /**
   * Refreshes access and refresh tokens using the provided refresh token.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
      }

      const { user, tokens } = await AuthService.refreshTokens(refreshToken);
      if (!user) throw new AppError("User not found", 404);

      res.json({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs out a user and revokes the refresh token.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
      }

      await AuthService.logout(refreshToken);

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

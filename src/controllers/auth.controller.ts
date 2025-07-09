import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { LoginSchema, RegisterSchema } from "../validation/auth.schema";
import { AppError } from "../errors/AppError";

export class AuthController {
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

  static async currentUser(req: Request, res: Response) {
    res.json({ user: req.user });
  }

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

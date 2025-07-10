import bcrypt from "bcryptjs";
import { CreateUserDTO, LoginUserDTO } from "../types/auth.types";
import UserService from "./user.service";
import { AppError } from "../errors/AppError";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";
import { RefreshTokenService } from "./refresh-token.service";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

export class AuthService {
  /**
   * Registers a new user and generates tokens.
   */
  static async registerUser(data: CreateUserDTO) {
    const existing = await UserService.findByEmail(data.email);
    if (existing) throw new AppError("Email already in use", 400);

    const user = await UserService.createUser(data);

    // Generate tokens
    const tokens = generateTokens({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    const decoded = jwt.decode(tokens.refreshToken) as jwt.JwtPayload;
    const refreshExpiresIn = decoded.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 7 * 24 * 60 * 60; // 7 days

    await RefreshTokenService.saveToken(
      tokens.refreshToken,
      user._id.toString(),
      refreshExpiresIn
    );

    return { user, tokens };
  }

  /**
   * Logs in a user and generates tokens.
   */
  static async loginUser(data: LoginUserDTO) {
    const user = await UserService.findByEmail(data.email);
    if (!user) throw new AppError("Invalid credentials", 401);

    logger.info("DB User", { password: user.password });
    logger.info("Login User", { password: data.password });

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials", 401);

    const tokens = generateTokens({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    // Save refresh token
    const decoded = jwt.decode(tokens.refreshToken) as jwt.JwtPayload;
    const refreshExpiresIn = decoded.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 7 * 24 * 60 * 60; // 7 days

    await RefreshTokenService.saveToken(
      tokens.refreshToken,
      user._id.toString(),
      refreshExpiresIn
    );

    return { user, tokens };
  }

  /**
   * Refreshes the access and refresh tokens using the provided refresh token.
   */
  static async refreshTokens(refreshToken: string) {
    // Verify token
    const { userId } = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const storedToken = await RefreshTokenService.findToken(refreshToken);
    if (!storedToken) throw new AppError("Invalid refresh token", 401);

    // Get user
    const user = await UserService.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    // Revoke current token (single-use)
    await RefreshTokenService.revokeToken(refreshToken);

    // Generate new tokens
    const tokens = generateTokens({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save new refresh token
    const decoded = jwt.decode(tokens.refreshToken) as jwt.JwtPayload;
    const refreshExpiresIn = decoded.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 7 * 24 * 60 * 60; // 7 days

    await RefreshTokenService.saveToken(
      tokens.refreshToken,
      user._id.toString(),
      refreshExpiresIn
    );

    return { user, tokens };
  }

  /**
   * Logs out a user by revoking their refresh token.
   * @param refreshToken - The refresh token to revoke.
   */
  static async logout(refreshToken: string) {
    try {
      await RefreshTokenService.revokeToken(refreshToken);
    } catch (error) {
      // Just log, don't throw
      logger.error("Logout error", { error });
    }
  }
}

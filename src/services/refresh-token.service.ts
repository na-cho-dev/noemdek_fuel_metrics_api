import { AppError } from "../errors/AppError";
import RefreshTokenModel from "../models/refresh-token.model";

export class RefreshTokenService {
  /**
   * Saves a new refresh token for a user.
   * @param token - The refresh token to save.
   * @param userId - The ID of the user associated with the token.
   * @param expiresIn - The expiration time in seconds.
   */
  static async saveToken(
    token: string,
    userId: string,
    expiresIn: number
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    await RefreshTokenModel.create({
      token,
      userId,
      expiresAt,
    });
  }

  /**
   * Finds a refresh token by its value.
   * @param token - The refresh token to find.
   */
  static async findToken(token: string) {
    return await RefreshTokenModel.findOne({ token, isRevoked: false });
  }

  /**
   * Revokes a refresh token, marking it as used.
   * @param token - The refresh token to revoke.
   */
  static async revokeToken(token: string): Promise<void> {
    const refreshToken = await RefreshTokenModel.findOne({ token });
    if (!refreshToken) throw new AppError("Refresh token not found", 404);

    refreshToken.isRevoked = true;
    await refreshToken.save();
  }

  /**
   * Deletes expired refresh tokens.
   */
  static async deleteExpiredTokens(): Promise<void> {
    await RefreshTokenModel.deleteMany({
      $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
    });
  }
}

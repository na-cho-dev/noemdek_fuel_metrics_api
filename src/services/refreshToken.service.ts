import { AppError } from "../errors/AppError";
import RefreshTokenModel from "../models/refreshToken.model";

export class RefreshTokenService {
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

  static async findToken(token: string) {
    return await RefreshTokenModel.findOne({ token, isRevoked: false });
  }

  static async revokeToken(token: string): Promise<void> {
    const refreshToken = await RefreshTokenModel.findOne({ token });
    if (!refreshToken) throw new AppError("Refresh token not found", 404);

    refreshToken.isRevoked = true;
    await refreshToken.save();
  }

  static async deleteExpiredTokens(): Promise<void> {
    await RefreshTokenModel.deleteMany({
      $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
    });
  }
}

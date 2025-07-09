import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { config } from "../config";

const JWT_ACCESS_SECRET: string = config.JWT.ACCESS_SECRET as string;
const JWT_ACCESS_EXPIRES_IN: string = config.JWT.ACCESS_EXPIRES_IN ?? "7d";
const JWT_REFRESH_SECRET: string = config.JWT.REFRESH_SECRET as string;
const JWT_REFRESH_EXPIRES_IN: string = config.JWT.REFRESH_EXPIRES_IN ?? "7d";

interface TokenPayload {
  userId: string;
  email: string;
  role?: string; // Optional, can be used for role-based access control
  // Optionally add: role, etc.
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload extends JwtPayload {
  userId: string;
  email: string;
}

/**
 * Signs a JWT token with the provided payload and options.
 * @param payload - The payload to sign, must include userId and email.
 * @param options - Optional signing options.
 * @returns The signed JWT token.
 * @throws AppError if payload is missing userId or email.
 */
export const signToken = (
  payload: TokenPayload,
  options?: SignOptions
): string => {
  if (!payload?.userId)
    throw new AppError("Payload must contain a valid userId", 500);

  if (!payload?.email)
    throw new AppError("Payload must contain a valid email", 500);

  const jwtOptions: SignOptions = {
    expiresIn: JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
    ...(options || {}),
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, jwtOptions);
};

/**
 * Signs a refresh JWT token with the provided userId and options.
 * @param userId - The user ID to include in the token payload.
 * @param options - Optional signing options.
 * @returns The signed refresh JWT token.
 * @throws AppError if userId is not provided.
 */
export const signRefreshToken = (
  userId: string,
  options?: SignOptions
): string => {
  if (!userId) throw new AppError("UserId is required for refresh token", 500);

  const jwtOptions: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
    ...(options || {}),
  };

  return jwt.sign({ userId }, JWT_REFRESH_SECRET, jwtOptions);
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param token - The JWT token to verify.
 * @returns The decoded payload if verification is successful.
 * @throws AppError if the token is invalid or expired.
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Token has expired", 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid token", 401);
    } else {
      throw new AppError("Token verification failed", 401);
    }
  }
};

/**
 * Verifies a refresh JWT token and returns the user ID.
 * @param token - The refresh JWT token to verify.
 * @returns The user ID if verification is successful.
 * @throws AppError if the token is invalid or expired.
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    if (!decoded.userId) throw new AppError("Invalid refresh token", 401);

    return { userId: decoded.userId as string };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Refresh token has expired", 401);
    } else {
      throw new AppError("Invalid refresh token", 401);
    }
  }
};

/**
 * Generates access and refresh tokens for a user.
 * @param user - The user object containing the necessary information.
 * @returns An object containing the access token, refresh token, and expiration time.
 */
export const generateTokens = (user: {
  _id: string;
  email: string;
  role?: string;
}): TokenResponse => {
  const accessToken = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken(user._id.toString());

  // Calculate expiration in seconds
  const decoded = jwt.decode(accessToken) as JwtPayload;
  const expiresIn = decoded.exp
    ? decoded.exp - Math.floor(Date.now() / 1000)
    : 900; // Default 15 minutes

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

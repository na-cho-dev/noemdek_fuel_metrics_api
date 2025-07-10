/**
 * @fileoverview Authentication Middleware Tests
 * @description Tests for JWT authentication middleware
 * @testFile auth.middleware.test.ts
 */

import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { authMiddleware } from "../../middleware";
import UserModel from "../../models/user.model";
import { Roles } from "../../config/roles";

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Protected route
  app.get("/protected", authMiddleware.authenticate, (req, res) => {
    res.json({
      success: true,
      user: req.user,
      message: "Access granted",
    });
  });

  return app;
};

describe("Authentication Middleware Tests", () => {
  const testApp = createTestApp();

  // Clean up database before each test
  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe("Valid Token Authentication", () => {
    it("should allow access with valid token", async () => {
      // Create a real user in the database
      const testUser = await UserModel.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        isVerified: true,
        role: Roles.ANALYST,
      });

      // Create a valid test token with the real user ID
      const token = jwt.sign(
        { userId: testUser._id.toString(), email: testUser.email },
        config.JWT.ACCESS_SECRET
      );

      const res = await request(testApp)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      console.log("Response status:", res.statusCode);
      console.log("Response body:", res.body);
      console.log("User ID from token:", testUser._id.toString());

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", "test@example.com");
    });
  });

  describe("Invalid Token Authentication", () => {
    it("should reject request without token", async () => {
      const res = await request(testApp).get("/protected");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message");
    });

    it("should reject request with malformed token", async () => {
      const res = await request(testApp)
        .get("/protected")
        .set("Authorization", "Bearer invalid-token");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should reject request with expired token", async () => {
      // Create an expired token
      const testUser = { userId: "123", email: "test@example.com" };
      const expiredToken = jwt.sign(testUser, config.JWT.ACCESS_SECRET, {
        expiresIn: "0s",
      });

      // Wait a moment to ensure token is expired
      await new Promise((resolve) => setTimeout(resolve, 100));

      const res = await request(testApp)
        .get("/protected")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should reject token with wrong secret", async () => {
      // Create token with wrong secret
      const testUser = { userId: "123", email: "test@example.com" };
      const wrongToken = jwt.sign(testUser, "wrong-secret");

      const res = await request(testApp)
        .get("/protected")
        .set("Authorization", `Bearer ${wrongToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("Token Format Validation", () => {
    it("should reject token without Bearer prefix", async () => {
      const testUser = { userId: "123", email: "test@example.com" };
      const token = jwt.sign(testUser, config.JWT.ACCESS_SECRET);

      const res = await request(testApp)
        .get("/protected")
        .set("Authorization", token); // Missing "Bearer " prefix

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle authorization header edge cases", async () => {
      const res = await request(testApp)
        .get("/protected")
        .set("Authorization", "Bearer "); // Empty token

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});

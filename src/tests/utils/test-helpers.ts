/**
 * @fileoverview Test Helper Utilities
 * @description Reusable utility functions for testing authentication, database operations, and API requests
 */

import request from "supertest";
import { createTestApp } from "../test-app";

export class TestHelpers {
  private static app = createTestApp();

  // Generate a unique identifier for test data
  static generateUniqueId() {
    // Add process ID and additional entropy to ensure uniqueness across parallel test runs
    return `${Date.now()}-${process.pid}-${Math.random()
      .toString(36)
      .substring(2, 15)}-${Math.random()
      .toString(36)
      .substring(2, 15)}-${performance.now().toString().replace(".", "")}`;
  }

  // Helper to register a test user
  static async registerUser(
    userData = {
      email: `test.${this.generateUniqueId()}@example.com`,
      password: "password123!",
      name: "Test User",
    }
  ): Promise<import("supertest").Response> {
    const response = await request(this.app)
      .post("/api/auth/register")
      .send(userData);

    return response;
  }

  // Helper to login and get token
  static async loginUser(
    credentials = {
      email: `test.${this.generateUniqueId()}@example.com`,
      password: "password123!",
    }
  ) {
    // Generate unique email for this login attempt
    const uniqueEmail = credentials.email.includes("@")
      ? credentials.email
      : `test.${this.generateUniqueId()}@example.com`;

    // First register the user
    await this.registerUser({
      email: uniqueEmail,
      password: credentials.password,
      name: "Test User",
    });

    // Then login
    const response = await request(this.app).post("/api/auth/login").send({
      email: uniqueEmail,
      password: credentials.password,
    });

    return response.body.accessToken;
  }

  // Helper to create authenticated request
  static async authenticatedRequest(
    method: string,
    endpoint: string,
    token?: string
  ): Promise<import("supertest").Test> {
    const authToken = token || (await this.loginUser());

    const agent = request(this.app);
    switch (method.toLowerCase()) {
      case "get":
        return agent.get(endpoint).set("Authorization", `Bearer ${authToken}`);
      case "post":
        return agent.post(endpoint).set("Authorization", `Bearer ${authToken}`);
      case "put":
        return agent.put(endpoint).set("Authorization", `Bearer ${authToken}`);
      case "delete":
        return agent
          .delete(endpoint)
          .set("Authorization", `Bearer ${authToken}`);
      case "patch":
        return agent
          .patch(endpoint)
          .set("Authorization", `Bearer ${authToken}`);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  // Helper to create test fuel data
  static createTestFuelData(overrides = {}) {
    return {
      state: "Lagos",
      period: new Date("2024-01-01"),
      AGO: 750.5,
      PMS: 617.0,
      DPK: 650.25,
      LPG: 450.75,
      region: "South West",
      ...overrides,
    };
  }

  // Get test app instance
  static getApp() {
    return this.app;
  }
}

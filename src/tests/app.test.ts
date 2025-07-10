/**
 * @fileoverview Application Health and Info Endpoints Tests
 * @description Tests for core application endpoints including health checks and API info
 * @testFile app.test.ts
 */

import request from "supertest";
import { createTestApp } from "./test-app";

const app = createTestApp();

describe("Application Health and Info Endpoints", () => {
  describe("GET /health", () => {
    it("should return status OK with health data", async () => {
      const res = await request(app).get("/health");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "OK");
      expect(res.body).toHaveProperty("environment");
      expect(res.body).toHaveProperty("uptime");
      expect(res.body).toHaveProperty("memory");
      expect(res.body).toHaveProperty("timestamp");
      expect(res.body).toHaveProperty("version", "1.0.0");
    });
  });

  describe("GET /health/detailed", () => {
    it("should return detailed health information", async () => {
      const res = await request(app).get("/health/detailed");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "OK");
      expect(res.body).toHaveProperty("dependencies");
      expect(res.body.dependencies).toHaveProperty("mongodb");
    });
  });

  describe("GET /", () => {
    it("should return API running message", async () => {
      const res = await request(app).get("/");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Express API is running!");
      expect(res.body).toHaveProperty("version", "1.0.0");
      expect(res.body).toHaveProperty("environment");
      expect(res.body).toHaveProperty("timestamp");
    });
  });

  describe("GET /api-info", () => {
    it("should return API information", async () => {
      const res = await request(app).get("/api-info");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name", "NOEMDEK Technical Interview");
      expect(res.body).toHaveProperty("version", "1.0.0");
      expect(res.body).toHaveProperty("description");
      expect(res.body).toHaveProperty("endpoints");
      expect(res.body.endpoints).toHaveProperty("health");
      expect(res.body.endpoints).toHaveProperty("detailedHealth");
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for non-existent routes", async () => {
      const res = await request(app).get("/non-existent-route");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Not Found");
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("availableEndpoints");
    });
  });
});

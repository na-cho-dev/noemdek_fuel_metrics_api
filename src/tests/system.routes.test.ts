import request from "supertest";
import { createTestApp } from "./test-app";

const app = createTestApp();

describe("System Routes", () => {
  describe("GET /", () => {
    it("should return API status and basic information", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "NOEMDEK Fuel Metrics API is running!"
      );
      expect(response.body).toHaveProperty("version", "1.0.0");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("endpoints");
      expect(response.body.endpoints).toHaveProperty("health", "/health");
      expect(response.body.endpoints).toHaveProperty("docs", "/api-docs");
    });
  });

  describe("GET /health", () => {
    it("should return comprehensive health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("memory");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("version", "1.0.0");
      expect(response.body).toHaveProperty("dependencies");
      expect(response.body.dependencies).toHaveProperty("mongodb");
      expect(response.body.dependencies.mongodb).toHaveProperty("status");
      expect(response.body.dependencies.mongodb).toHaveProperty("latency");
      expect(response.body).toHaveProperty("system");
      expect(response.body.system).toHaveProperty("nodeVersion");
      expect(response.body.system).toHaveProperty("platform");
      expect(response.body.system).toHaveProperty("arch");
    });

    it("should handle health check errors gracefully", async () => {
      // This test assumes that database connection might fail
      // The health endpoint should still respond with appropriate error information
      const response = await request(app).get("/health");

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");

      if (response.status === 503) {
        expect(response.body).toHaveProperty("status", "error");
        expect(response.body).toHaveProperty("message", "Service unhealthy");
        expect(response.body).toHaveProperty("error");
      }
    });
  });
});

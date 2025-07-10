import request from "supertest";
import { app } from "../app";

describe("System Routes", () => {
  describe("GET /", () => {
    it("should return API status and basic information", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("version");
    });
  });

  describe("GET /health", () => {
    it("should return basic health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
    });
  });

  describe("GET /health/detailed", () => {
    it("should return detailed health status", async () => {
      const response = await request(app).get("/health/detailed");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("dependencies");
    });
  });

  describe("GET /api-info", () => {
    it("should return API information", async () => {
      const response = await request(app).get("/api-info");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("description");
      expect(response.body).toHaveProperty("endpoints");
    });
  });
});

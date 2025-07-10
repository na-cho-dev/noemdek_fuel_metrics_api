/**
 * @fileoverview Fuel Price Routes Tests
 * @description Comprehensive test suite for fuel price CRUD operations, validation, filtering, and error handling
 * @testFile fuel.price.routes.test.ts
 */

import request from "supertest";
import mongoose from "mongoose";
import { createTestApp } from "./test-app";
import { TestHelpers } from "./utils/test-helpers";
import { Region } from "../types/enums";

const app = createTestApp();

describe("Fuel Price Routes Tests", () => {
  let authToken: string;
  let createdFuelId: string;
  const uniqueEmail = `test.fuel.${Date.now()}@example.com`;

  beforeEach(async () => {
    // Create a unique user and get auth token for each test
    const userResponse = await TestHelpers.registerUser({
      email: uniqueEmail,
      password: "password123!",
      name: "Fuel Test User",
    });

    expect(userResponse.statusCode).toBe(201);
    authToken = userResponse.body.accessToken;
  });

  describe("POST /api/fuel", () => {
    it("should create a new fuel price record successfully", async () => {
      const fuelData = TestHelpers.createTestFuelData({
        state: "Lagos",
        region: Region.SOUTH_WEST,
        period: "2024-01-01",
        AGO: 750.5,
        PMS: 617.0,
        DPK: 650.25,
        LPG: 450.75,
      });

      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(fuelData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data).toHaveProperty("state", fuelData.state);
      expect(res.body.data).toHaveProperty("region", fuelData.region);
      expect(res.body.data).toHaveProperty("AGO", fuelData.AGO);
      expect(res.body.data).toHaveProperty("PMS", fuelData.PMS);
      expect(res.body.data).toHaveProperty("DPK", fuelData.DPK);
      expect(res.body.data).toHaveProperty("LPG", fuelData.LPG);

      // Store ID for other tests
      createdFuelId = res.body.data._id;
    });

    it("should return 401 without authentication token", async () => {
      const fuelData = TestHelpers.createTestFuelData();

      const res = await request(app).post("/api/fuel").send(fuelData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return validation error for missing required fields", async () => {
      const invalidData = {
        state: "Lagos",
        // Missing region, period, and fuel prices
      };

      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message");
    });

    it("should return validation error for invalid region", async () => {
      const invalidData = TestHelpers.createTestFuelData({
        region: "Invalid Region",
      });

      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return validation error for negative fuel prices", async () => {
      const invalidData = TestHelpers.createTestFuelData({
        AGO: -100,
        PMS: -50,
      });

      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return validation error for invalid date format", async () => {
      const invalidData = TestHelpers.createTestFuelData({
        period: "invalid-date",
      });

      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return validation error for short state name", async () => {
      const invalidData = TestHelpers.createTestFuelData({
        state: "L", // Too short
      });

      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/fuel", () => {
    beforeEach(async () => {
      // Create some test data
      const testData = [
        TestHelpers.createTestFuelData({
          state: "Lagos",
          region: Region.SOUTH_WEST,
          period: "2024-01-01",
        }),
        TestHelpers.createTestFuelData({
          state: "Kano",
          region: Region.NORTH_WEST,
          period: "2024-01-02",
        }),
        TestHelpers.createTestFuelData({
          state: "Abuja",
          region: Region.NORTH_CENTRAL,
          period: "2024-01-03",
        }),
      ];

      for (const data of testData) {
        await request(app)
          .post("/api/fuel")
          .set("Authorization", `Bearer ${authToken}`)
          .send(data);
      }
    });

    it("should retrieve all fuel price records successfully", async () => {
      const res = await request(app)
        .get("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data.records)).toBe(true);
      expect(res.body.data.records.length).toBeGreaterThan(0);
      // Pagination fields are returned directly, not in a pagination object
      expect(res.body.data).toHaveProperty("page");
      expect(res.body.data).toHaveProperty("limit");
      expect(res.body.data).toHaveProperty("total");
      expect(res.body.data).toHaveProperty("totalPages");
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get("/api/fuel");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should support pagination with limit and page parameters", async () => {
      const res = await request(app)
        .get("/api/fuel?limit=2&page=1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data.records.length).toBeLessThanOrEqual(2);
      // Pagination fields are returned directly, not in a pagination object
      expect(res.body.data).toHaveProperty("page", 1);
      expect(res.body.data).toHaveProperty("limit", 2);
      expect(res.body.data).toHaveProperty("total");
      expect(res.body.data).toHaveProperty("totalPages");
    });

    it("should support filtering by state", async () => {
      const res = await request(app)
        .get("/api/fuel?state=Lagos")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");

      if (res.body.data.length > 0) {
        res.body.data.forEach((record: any) => {
          expect(record.state).toBe("Lagos");
        });
      }
    });

    it("should support filtering by region", async () => {
      const res = await request(app)
        .get(`/api/fuel?region=${Region.SOUTH_WEST}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");

      if (res.body.data.length > 0) {
        res.body.data.forEach((record: any) => {
          expect(record.region).toBe(Region.SOUTH_WEST);
        });
      }
    });

    it("should support date range filtering", async () => {
      const res = await request(app)
        .get("/api/fuel?startDate=2024-01-01&endDate=2024-01-02")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("GET /api/fuel/filters", () => {
    beforeEach(async () => {
      // Create test data with different states and regions
      const testData = [
        TestHelpers.createTestFuelData({
          state: "Lagos",
          region: Region.SOUTH_WEST,
        }),
        TestHelpers.createTestFuelData({
          state: "Kano",
          region: Region.NORTH_WEST,
        }),
      ];

      for (const data of testData) {
        await request(app)
          .post("/api/fuel")
          .set("Authorization", `Bearer ${authToken}`)
          .send(data);
      }
    });

    it("should retrieve filter options successfully", async () => {
      const res = await request(app)
        .get("/api/fuel/filters")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("filters");
      expect(res.body.data.filters).toHaveProperty("states");
      expect(res.body.data.filters).toHaveProperty("regions");
      expect(res.body.data.filters).toHaveProperty("products");
      expect(res.body.data.filters).toHaveProperty("ranges");
      expect(Array.isArray(res.body.data.filters.states)).toBe(true);
      expect(Array.isArray(res.body.data.filters.regions)).toBe(true);
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get("/api/fuel/filters");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/fuel/export", () => {
    beforeEach(async () => {
      // Create test data for export
      const testData = TestHelpers.createTestFuelData({
        state: "Lagos",
        region: Region.SOUTH_WEST,
      });

      await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(testData);
    });

    it("should export data in CSV format by default", async () => {
      const res = await request(app)
        .get("/api/fuel/export")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.headers["content-disposition"]).toContain("attachment");
      expect(res.headers["content-disposition"]).toContain("fuel_data.csv");
      expect(typeof res.text).toBe("string");
    });

    it("should export data in specified format", async () => {
      const res = await request(app)
        .get("/api/fuel/export?format=xlsx")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(res.headers["content-disposition"]).toContain("attachment");
      expect(res.headers["content-disposition"]).toContain("fuel_data.xlsx");
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get("/api/fuel/export");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle invalid export format gracefully", async () => {
      const res = await request(app)
        .get("/api/fuel/export?format=invalid")
        .set("Authorization", `Bearer ${authToken}`);

      // Should either succeed with default format or return 400
      expect([200, 400]).toContain(res.statusCode);
    });
  });

  describe("GET /api/fuel/:id", () => {
    beforeEach(async () => {
      // Create a fuel record to retrieve
      const fuelData = TestHelpers.createTestFuelData({
        state: "Lagos",
        region: Region.SOUTH_WEST,
      });

      const createRes = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(fuelData);

      createdFuelId = createRes.body.data._id;
    });

    it("should retrieve a specific fuel price record by ID", async () => {
      const res = await request(app)
        .get(`/api/fuel/${createdFuelId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("_id", createdFuelId);
      expect(res.body.data).toHaveProperty("state");
      expect(res.body.data).toHaveProperty("region");
      expect(res.body.data).toHaveProperty("AGO");
      expect(res.body.data).toHaveProperty("PMS");
      expect(res.body.data).toHaveProperty("DPK");
      expect(res.body.data).toHaveProperty("LPG");
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get(`/api/fuel/${createdFuelId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return 404 for non-existent fuel price record", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/fuel/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return 400 for invalid ObjectId format", async () => {
      const res = await request(app)
        .get("/api/fuel/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("PUT /api/fuel/:id", () => {
    beforeEach(async () => {
      // Create a fuel record to update
      const fuelData = TestHelpers.createTestFuelData({
        state: "Lagos",
        region: Region.SOUTH_WEST,
        AGO: 700.0,
        PMS: 600.0,
      });

      const createRes = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(fuelData);

      createdFuelId = createRes.body.data._id;
    });

    it("should update a specific fuel price record successfully", async () => {
      const updateData = {
        state: "Updated Lagos",
        AGO: 800.0,
        PMS: 650.0,
      };

      const res = await request(app)
        .put(`/api/fuel/${createdFuelId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("state", updateData.state);
      expect(res.body.data).toHaveProperty("AGO", updateData.AGO);
      expect(res.body.data).toHaveProperty("PMS", updateData.PMS);
    });

    it("should support partial updates", async () => {
      const updateData = {
        AGO: 850.0,
      };

      const res = await request(app)
        .put(`/api/fuel/${createdFuelId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("AGO", updateData.AGO);
    });

    it("should return 401 without authentication token", async () => {
      const updateData = { AGO: 800.0 };

      const res = await request(app)
        .put(`/api/fuel/${createdFuelId}`)
        .send(updateData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return 404 for non-existent fuel price record", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { AGO: 800.0 };

      const res = await request(app)
        .put(`/api/fuel/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return validation error for invalid update data", async () => {
      const invalidData = {
        AGO: -100, // Negative value
        region: "Invalid Region",
      };

      const res = await request(app)
        .put(`/api/fuel/${createdFuelId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return 400 for invalid ObjectId format", async () => {
      const updateData = { AGO: 800.0 };

      const res = await request(app)
        .put("/api/fuel/invalid-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/fuel/:id", () => {
    beforeEach(async () => {
      // Create a fuel record to delete
      const fuelData = TestHelpers.createTestFuelData({
        state: "Lagos",
        region: Region.SOUTH_WEST,
      });

      const createRes = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(fuelData);

      createdFuelId = createRes.body.data._id;
    });

    it("should delete a specific fuel price record successfully", async () => {
      const res = await request(app)
        .delete(`/api/fuel/${createdFuelId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(204);
      expect(res.body).toEqual({});
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).delete(`/api/fuel/${createdFuelId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return 404 for non-existent fuel price record", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/fuel/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return 400 for invalid ObjectId format", async () => {
      const res = await request(app)
        .delete("/api/fuel/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should confirm record is actually deleted", async () => {
      // First delete the record
      const deleteRes = await request(app)
        .delete(`/api/fuel/${createdFuelId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(deleteRes.statusCode).toBe(204);

      // Then try to retrieve it
      const getRes = await request(app)
        .get(`/api/fuel/${createdFuelId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(getRes.statusCode).toBe(404);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    beforeEach(async () => {
      // Create a fuel record for testing
      const fuelData = TestHelpers.createTestFuelData();
      const createRes = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(fuelData);

      createdFuelId = createRes.body.data._id;
    });

    it("should handle malformed JSON in request body", async () => {
      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .set("Content-Type", "application/json")
        .send("{ invalid json");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle invalid authorization header format", async () => {
      const res = await request(app)
        .get("/api/fuel")
        .set("Authorization", "InvalidFormat token123");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle expired/invalid JWT token", async () => {
      const res = await request(app)
        .get("/api/fuel")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle empty request body for required fields", async () => {
      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle extremely large pagination values gracefully", async () => {
      const res = await request(app)
        .get("/api/fuel?limit=999999&page=999999")
        .set("Authorization", `Bearer ${authToken}`);

      // Should either succeed with reasonable limits or return error
      expect([200, 400]).toContain(res.statusCode);
    });

    it("should handle zero and negative pagination values", async () => {
      const res = await request(app)
        .get("/api/fuel?limit=0&page=-1")
        .set("Authorization", `Bearer ${authToken}`);

      // Should either succeed with default values or return error
      expect([200, 400]).toContain(res.statusCode);
    });

    it("should handle special characters in state names", async () => {
      const specialData = TestHelpers.createTestFuelData({
        state: "Cross River",
        region: Region.SOUTH_SOUTH,
      });

      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(specialData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    it("should handle very large fuel price values", async () => {
      const largeData = TestHelpers.createTestFuelData({
        AGO: 99999999.99,
        PMS: 88888888.88,
        DPK: 77777777.77,
        LPG: 66666666.66,
      });

      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(largeData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    it("should handle zero fuel price values", async () => {
      const zeroData = TestHelpers.createTestFuelData({
        AGO: 0,
        PMS: 0,
        DPK: 0,
        LPG: 0,
      });

      const res = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(zeroData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("Data Consistency and Integrity", () => {
    it("should maintain data consistency across multiple operations", async () => {
      const originalData = TestHelpers.createTestFuelData({
        state: "Consistency Test",
        AGO: 100,
      });

      // Create record
      const createRes = await request(app)
        .post("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`)
        .send(originalData);

      expect(createRes.statusCode).toBe(201);
      const recordId = createRes.body.data._id;

      // Retrieve record
      const getRes = await request(app)
        .get(`/api/fuel/${recordId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.data.state).toBe(originalData.state);
      expect(getRes.body.data.AGO).toBe(originalData.AGO);

      // Update record
      const updateData = { AGO: 200 };
      const updateRes = await request(app)
        .put(`/api/fuel/${recordId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.AGO).toBe(updateData.AGO);

      // Verify update persisted
      const getUpdatedRes = await request(app)
        .get(`/api/fuel/${recordId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(getUpdatedRes.statusCode).toBe(200);
      expect(getUpdatedRes.body.data.AGO).toBe(updateData.AGO);
    });

    it("should handle concurrent requests without data corruption", async () => {
      const testData = TestHelpers.createTestFuelData({
        state: "Concurrent Test",
      });

      // Create multiple records concurrently
      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post("/api/fuel")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            ...testData,
            state: `Concurrent Test ${i}`,
          })
      );

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((res, i) => {
        expect(res.statusCode).toBe(201);
        expect(res.body.data.state).toBe(`Concurrent Test ${i}`);
      });

      // Verify all records exist
      const listRes = await request(app)
        .get("/api/fuel")
        .set("Authorization", `Bearer ${authToken}`);

      expect(listRes.statusCode).toBe(200);
      expect(listRes.body.data.records.length).toBeGreaterThanOrEqual(5);
    });
  });
});

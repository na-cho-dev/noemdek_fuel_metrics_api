/**
 * @fileoverview Fuel Analysis Routes Tests
 * @description Comprehensive test suite for fuel analysis endpoints including summary, trends, reports, and analytics
 * @testFile fuel.analysis.routes.test.ts
 */

import request from "supertest";
import { createTestApp } from "./test-app";
import { TestHelpers } from "./utils/test-helpers";
import { Region } from "../types/enums";
import FuelModel from "../models/fuel.model";

const app = createTestApp();

describe("Fuel Analysis Routes Tests", () => {
  let authToken: string;
  const uniqueEmail = `test.analysis.${Date.now()}@example.com`;

  beforeEach(async () => {
    // Create a unique user and get auth token for each test
    const userResponse = await TestHelpers.registerUser({
      email: uniqueEmail,
      password: "password123!",
      name: "Analysis Test User",
    });

    expect(userResponse.statusCode).toBe(201);
    authToken = userResponse.body.accessToken;
  });

  // Helper function to create test fuel data with multiple entries
  const createTestDataSet = async () => {
    const testData = [
      {
        state: "Lagos",
        region: Region.SOUTH_WEST,
        period: new Date("2024-01-01"),
        AGO: 750.5,
        PMS: 617.0,
        DPK: 650.25,
        LPG: 450.75,
      },
      {
        state: "Lagos",
        region: Region.SOUTH_WEST,
        period: new Date("2024-01-02"),
        AGO: 755.0,
        PMS: 620.0,
        DPK: 655.0,
        LPG: 455.0,
      },
      {
        state: "Kano",
        region: Region.NORTH_WEST,
        period: new Date("2024-01-01"),
        AGO: 745.0,
        PMS: 612.0,
        DPK: 645.0,
        LPG: 445.0,
      },
      {
        state: "Kano",
        region: Region.NORTH_WEST,
        period: new Date("2024-01-02"),
        AGO: 748.0,
        PMS: 615.0,
        DPK: 648.0,
        LPG: 448.0,
      },
      {
        state: "Abuja",
        region: Region.NORTH_CENTRAL,
        period: new Date("2024-01-01"),
        AGO: 740.0,
        PMS: 610.0,
        DPK: 640.0,
        LPG: 440.0,
      },
      {
        state: "Abuja",
        region: Region.NORTH_CENTRAL,
        period: new Date("2024-01-02"),
        AGO: 742.0,
        PMS: 612.0,
        DPK: 642.0,
        LPG: 442.0,
      },
    ];

    // Clear existing data and insert test data
    await FuelModel.deleteMany({});
    await FuelModel.insertMany(testData);
  };

  describe("GET /api/fuel-analysis/summary", () => {
    beforeEach(async () => {
      await createTestDataSet();
    });

    it("should retrieve fuel price summary with changes successfully", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/summary")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);

      // Should have data for all fuel products
      expect(res.body.data.length).toBeGreaterThan(0);

      // Check structure of summary data
      if (res.body.data.length > 0) {
        const summaryItem = res.body.data[0];
        expect(summaryItem).toHaveProperty("product");
        expect(summaryItem).toHaveProperty("currentPrice");
        expect(summaryItem).toHaveProperty("previousPrice");
        expect(summaryItem).toHaveProperty("valueChange");
        expect(summaryItem).toHaveProperty("percentageChange");
        expect(summaryItem).toHaveProperty("trendDirection");
        expect(["up", "down", "no-change"]).toContain(
          summaryItem.trendDirection
        );
      }
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get("/api/fuel-analysis/summary");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle empty data gracefully", async () => {
      await FuelModel.deleteMany({});

      const res = await request(app)
        .get("/api/fuel-analysis/summary")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /api/fuel-analysis/average/all-time", () => {
    beforeEach(async () => {
      await createTestDataSet();
    });

    it("should retrieve all-time national average successfully", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/average/all-time")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("avgAGO");
      expect(res.body.data).toHaveProperty("avgPMS");
      expect(res.body.data).toHaveProperty("avgDPK");
      expect(res.body.data).toHaveProperty("avgLPG");

      // Check that averages are numbers
      expect(typeof res.body.data.avgAGO).toBe("number");
      expect(typeof res.body.data.avgPMS).toBe("number");
      expect(typeof res.body.data.avgDPK).toBe("number");
      expect(typeof res.body.data.avgLPG).toBe("number");
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get("/api/fuel-analysis/average/all-time");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/fuel-analysis/average-by-region", () => {
    beforeEach(async () => {
      await createTestDataSet();
    });

    it("should retrieve average prices by region successfully", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/average-by-region")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      // Check structure of regional data
      const regionData = res.body.data[0];
      expect(regionData).toHaveProperty("region");
      expect(regionData).toHaveProperty("avgAGO");
      expect(regionData).toHaveProperty("avgPMS");
      expect(regionData).toHaveProperty("avgDPK");
      expect(regionData).toHaveProperty("avgLPG");
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get(
        "/api/fuel-analysis/average-by-region"
      );

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/fuel-analysis/top/:product", () => {
    beforeEach(async () => {
      await createTestDataSet();
    });

    it("should retrieve top states by product (descending order)", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/top/PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(5);

      if (res.body.data.length > 0) {
        const stateData = res.body.data[0];
        expect(stateData).toHaveProperty("state");
        expect(stateData).toHaveProperty("value");
        expect(typeof stateData.value).toBe("number");
      }
    });

    it("should retrieve top states by product (ascending order)", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/top/AGO?order=asc")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");

      // Check ascending order
      if (res.body.data.length > 1) {
        expect(res.body.data[0].value).toBeLessThanOrEqual(
          res.body.data[1].value
        );
      }
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get("/api/fuel-analysis/top/PMS");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle invalid product gracefully", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/top/INVALID")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/fuel-analysis/trends", () => {
    beforeEach(async () => {
      await createTestDataSet();
    });

    it("should retrieve trends with required product parameter", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/trends?product=PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("filters");
      expect(res.body.data).toHaveProperty("trend");
      expect(res.body.data.filters).toHaveProperty("product", "PMS");
      expect(Array.isArray(res.body.data.trend)).toBe(true);

      if (res.body.data.trend.length > 0) {
        const trendItem = res.body.data.trend[0];
        expect(trendItem).toHaveProperty("date");
        expect(trendItem).toHaveProperty("price");
        expect(typeof trendItem.price).toBe("number");
      }
    });

    it("should retrieve trends filtered by state", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/trends?product=AGO&state=Lagos")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.filters).toHaveProperty("state", "Lagos");
      expect(res.body.data.filters).toHaveProperty("product", "AGO");
    });

    it("should retrieve trends filtered by region", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/trends?product=DPK&region=South West")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.filters).toHaveProperty("region", "South West");
      expect(res.body.data.filters).toHaveProperty("product", "DPK");
    });

    it("should support custom date range", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/trends?product=LPG&range=7d")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.filters).toHaveProperty("range", "7d");
    });

    it("should return 400 for missing product parameter", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/trends")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "Invalid or missing product type"
      );
    });

    it("should return 400 for invalid product type", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/trends?product=INVALID")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "Invalid or missing product type"
      );
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get(
        "/api/fuel-analysis/trends?product=PMS"
      );

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/fuel-analysis/mini-trend", () => {
    beforeEach(async () => {
      await createTestDataSet();
    });

    it("should retrieve mini trend data successfully", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/mini-trend?state=Lagos&product=PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("state", "Lagos");
      expect(res.body.data).toHaveProperty("product", "PMS");
      expect(res.body.data).toHaveProperty("trend");
      expect(Array.isArray(res.body.data.trend)).toBe(true);

      if (res.body.data.trend.length > 0) {
        const trendItem = res.body.data.trend[0];
        expect(trendItem).toHaveProperty("period");
        expect(trendItem).toHaveProperty("price");
        expect(typeof trendItem.price).toBe("number");
      }
    });

    it("should return 400 for missing state parameter", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/mini-trend?product=PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "state and product are required"
      );
    });

    it("should return 400 for missing product parameter", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/mini-trend?state=Lagos")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "state and product are required"
      );
    });

    it("should return 400 for invalid product type", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/mini-trend?state=Lagos&product=INVALID")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Invalid product type");
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get(
        "/api/fuel-analysis/mini-trend?state=Lagos&product=PMS"
      );

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/fuel-analysis/price-change", () => {
    beforeEach(async () => {
      await createTestDataSet();
    });

    it("should retrieve price change data successfully", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/price-change?state=Lagos&product=PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("state", "Lagos");
      expect(res.body.data).toHaveProperty("product", "PMS");
      expect(res.body.data).toHaveProperty("range", "7d");
      expect(res.body.data).toHaveProperty("currentPrice");
      expect(res.body.data).toHaveProperty("previousPrice");
      expect(res.body.data).toHaveProperty("change");
      expect(res.body.data).toHaveProperty("percentageChange");

      expect(typeof res.body.data.currentPrice).toBe("number");
      expect(typeof res.body.data.previousPrice).toBe("number");
      expect(typeof res.body.data.change).toBe("number");
      expect(typeof res.body.data.percentageChange).toBe("number");
    });

    it("should support custom date range", async () => {
      const res = await request(app)
        .get(
          "/api/fuel-analysis/price-change?state=Lagos&product=AGO&range=14d"
        )
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("range", "14d");
    });

    it("should return 400 for missing state parameter", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/price-change?product=PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "state and product are required"
      );
    });

    it("should return 400 for missing product parameter", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/price-change?state=Lagos")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "state and product are required"
      );
    });

    it("should return 400 for invalid product type", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/price-change?state=Lagos&product=INVALID")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Invalid product type");
    });

    it("should return 404 for insufficient data", async () => {
      // Clear data to simulate insufficient data scenario
      await FuelModel.deleteMany({});

      const res = await request(app)
        .get("/api/fuel-analysis/price-change?state=Lagos&product=PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "Insufficient data to calculate change"
      );
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get(
        "/api/fuel-analysis/price-change?state=Lagos&product=PMS"
      );

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/fuel-analysis/weekly-report", () => {
    beforeEach(async () => {
      // Create extended test data for weekly report
      const extendedTestData = [];
      const states = ["Lagos", "Kano", "Abuja", "Rivers", "Kaduna"];

      for (let i = 0; i < 7; i++) {
        const date = new Date("2024-01-01");
        date.setDate(date.getDate() + i);

        for (const state of states) {
          extendedTestData.push({
            state,
            region:
              state === "Lagos"
                ? Region.SOUTH_WEST
                : state === "Kano"
                  ? Region.NORTH_WEST
                  : state === "Abuja"
                    ? Region.NORTH_CENTRAL
                    : state === "Rivers"
                      ? Region.SOUTH_SOUTH
                      : Region.NORTH_WEST,
            period: date,
            AGO: 750 + Math.random() * 10,
            PMS: 617 + Math.random() * 10,
            DPK: 650 + Math.random() * 10,
            LPG: 450 + Math.random() * 10,
          });
        }
      }

      await FuelModel.deleteMany({});
      await FuelModel.insertMany(extendedTestData);
    });

    it("should retrieve weekly report successfully", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/weekly-report?product=PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("product", "PMS");
      expect(res.body.data).toHaveProperty("report");
      expect(Array.isArray(res.body.data.report)).toBe(true);

      if (res.body.data.report.length > 0) {
        const reportItem = res.body.data.report[0];
        expect(reportItem).toHaveProperty("state");
        expect(reportItem).toHaveProperty("currentPrice");
        expect(reportItem).toHaveProperty("previousPrice");
        expect(reportItem).toHaveProperty("change");
        expect(reportItem).toHaveProperty("percentageChange");
        expect(reportItem).toHaveProperty("trend");
        expect(Array.isArray(reportItem.trend)).toBe(true);
      }
    });

    it("should return 400 for missing product parameter", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/weekly-report")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Product is required");
    });

    it("should handle invalid product gracefully", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/weekly-report?product=INVALID")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.report).toEqual([]);
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get(
        "/api/fuel-analysis/weekly-report?product=PMS"
      );

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    beforeEach(async () => {
      await createTestDataSet();
    });

    it("should handle malformed query parameters gracefully", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/trends?product=PMS&range=invalid_range")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      // Should default to 30d range
      expect(res.body.data.filters).toHaveProperty("range", "invalid_range");
    });

    it("should handle invalid authorization header format", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/summary")
        .set("Authorization", "InvalidToken");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle expired/invalid JWT token", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/summary")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle empty database gracefully for trends", async () => {
      await FuelModel.deleteMany({});

      const res = await request(app)
        .get("/api/fuel-analysis/trends?product=PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.trend).toEqual([]);
    });

    it("should handle special characters in state names", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/mini-trend?state=Cross%20River&product=PMS")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    it("should handle case sensitivity in product parameters", async () => {
      const res = await request(app)
        .get("/api/fuel-analysis/trends?product=pms")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("Data Consistency and Performance", () => {
    it("should maintain consistent data structure across endpoints", async () => {
      await createTestDataSet();

      const [summaryRes, trendsRes, reportRes] = await Promise.all([
        request(app)
          .get("/api/fuel-analysis/summary")
          .set("Authorization", `Bearer ${authToken}`),
        request(app)
          .get("/api/fuel-analysis/trends?product=PMS")
          .set("Authorization", `Bearer ${authToken}`),
        request(app)
          .get("/api/fuel-analysis/weekly-report?product=PMS")
          .set("Authorization", `Bearer ${authToken}`),
      ]);

      expect(summaryRes.statusCode).toBe(200);
      expect(trendsRes.statusCode).toBe(200);
      expect(reportRes.statusCode).toBe(200);

      // All should have consistent success structure
      [summaryRes, trendsRes, reportRes].forEach((res) => {
        expect(res.body).toHaveProperty("success", true);
      });
    });

    it("should handle concurrent requests without data corruption", async () => {
      await createTestDataSet();

      const requests = Array.from({ length: 5 }, () =>
        request(app)
          .get("/api/fuel-analysis/summary")
          .set("Authorization", `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("success", true);
      });

      // All responses should be identical for concurrent requests
      const firstResponse = JSON.stringify(responses[0].body);
      responses.forEach((res) => {
        expect(JSON.stringify(res.body)).toBe(firstResponse);
      });
    });
  });
});

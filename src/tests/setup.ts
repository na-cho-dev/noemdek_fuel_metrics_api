/**
 * @fileoverview Global Test Setup Configuration
 * @description This file sets up the test environment with in-memory MongoDB
 * and runs before all tests. It's automatically loaded by Jest.
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { logger } from "../utils/logger";
import fs from "fs";
import path from "path";

let mongoServer: MongoMemoryServer | null = null;

// Setup before all tests across the entire test suite
beforeAll(async () => {
  const tmpDir = "/tmp";
  fs.readdirSync(tmpDir)
    .filter((f) => f.startsWith("mongodb-"))
    .forEach((f) => {
      try {
        fs.rmSync(path.join(tmpDir, f), { recursive: true, force: true });
      } catch (e) {
        // Ignore errors
      }
    });

  try {
    console.log("🔧 Setting up test environment...");

    // Start in-memory MongoDB instance with minimal configuration
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: undefined, // Random port
      },
    });
    const mongoUri = mongoServer.getUri();

    console.log(`📊 Test MongoDB URI: ${mongoUri}`);

    // Disconnect any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Connect mongoose to the in-memory database
    await mongoose.connect(mongoUri);

    // Suppress console logs during testing to keep output clean
    jest.spyOn(logger, "info").mockImplementation(() => logger);
    jest.spyOn(logger, "warn").mockImplementation(() => logger);
    jest.spyOn(logger, "error").mockImplementation(() => logger);

    console.log("✅ Test environment setup complete");
  } catch (error) {
    console.error("❌ Failed to setup test database:", error);
    process.exit(1);
  }
}, 120000); // Increase timeout to 120 seconds

// Cleanup after all tests are finished
afterAll(async () => {
  try {
    console.log("🧹 Cleaning up test environment...");

    // Disconnect mongoose
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Stop MongoDB memory server if it exists
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log("✅ Test environment cleaned up");
  } catch (error) {
    console.error("❌ Failed to cleanup test database:", error);
  }
}, 120000); // Increase timeout to 120 seconds

// Clear all collections before each test to ensure clean state
beforeEach(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      const clearPromises = [];

      for (const key in collections) {
        const collection = collections[key];
        clearPromises.push(collection.deleteMany({}));
      }

      // Wait for all collections to be cleared
      await Promise.all(clearPromises);

      // Wait to ensure operations are complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  } catch (error) {
    console.error("❌ Failed to clear test data before test:", error);
  }
});

// Clear all collections after each test to ensure test isolation
afterEach(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      const clearPromises = [];

      for (const key in collections) {
        const collection = collections[key];
        clearPromises.push(collection.deleteMany({}));
      }

      // Wait for all collections to be cleared
      await Promise.all(clearPromises);

      // Additional wait to ensure MongoDB has time to complete all operations
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error("❌ Failed to clear test data:", error);
  }
});

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

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = "test";

// Setup before all tests across the entire test suite
beforeAll(async () => {
  const tmpDir = "/tmp";
  fs.readdirSync(tmpDir)
    .filter((f) => f.startsWith("mongodb-"))
    .forEach((f) => {
      try {
        fs.rmSync(path.join(tmpDir, f), { recursive: true, force: true });
      } catch {
        // Ignore errors
      }
    });

  try {
    console.log("🔧 Setting up test environment...");

    // Ensure we're not connected to any existing database
    if (mongoose.connection.readyState !== 0) {
      console.log("🔌 Disconnecting existing database connection...");
      await mongoose.disconnect();
    }

    // Start in-memory MongoDB instance with minimal configuration
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: undefined, // Random port
        storageEngine: "wiredTiger", // Use the default storage engine
      },
      binary: {
        version: "6.0.4", // Use a stable version
      },
    });
    const mongoUri = mongoServer.getUri();

    console.log(`📊 Test MongoDB URI: ${mongoUri}`);

    // Connect mongoose to the in-memory database
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
    });

    // Verify connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Failed to connect to test database");
    }

    // Suppress console logs during testing to keep output clean
    jest.spyOn(logger, "info").mockImplementation(() => logger);
    jest.spyOn(logger, "warn").mockImplementation(() => logger);
    jest.spyOn(logger, "error").mockImplementation(() => logger);

    console.log("✅ Test environment setup complete");
  } catch (error) {
    console.error("❌ Failed to setup test database:", error);

    // Cleanup any partially created resources
    if (mongoServer) {
      try {
        await mongoServer.stop();
      } catch (stopError) {
        console.error("Failed to stop MongoDB server:", stopError);
      }
    }

    // Don't exit process in tests, just fail the test
    throw error;
  }
}, 180000); // Increase timeout to 180 seconds

// Cleanup after all tests are finished
afterAll(async () => {
  try {
    console.log("🧹 Cleaning up test environment...");

    // Disconnect mongoose with force option
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      // Wait a bit to ensure disconnection completes
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Stop MongoDB memory server if it exists
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }

    console.log("✅ Test environment cleaned up");
  } catch (error) {
    console.error("❌ Failed to cleanup test database:", error);
    // Don't throw in cleanup, just log the error
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

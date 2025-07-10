import mongoose from "mongoose";
import { config } from ".";
import logger from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info("MongoDB Connected");
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("Database connection closed through app termination");
  process.exit(0);
});

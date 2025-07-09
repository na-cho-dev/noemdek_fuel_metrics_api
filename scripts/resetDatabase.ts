import mongoose from "mongoose";
import { config } from "../src/config";

async function resetDatabase() {
  try {
    // Get collection name from command line argument (if provided)
    const collectionName = process.argv[2];

    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to DB");

    if (!mongoose.connection.db)
      throw new Error("Database connection is not established.");

    if (collectionName) {
      // Check if collection exists
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      const collectionExists = collections.some(
        (col) => col.name === collectionName
      );

      if (collectionExists) {
        await mongoose.connection.db.dropCollection(collectionName);
        console.log(`🗑 Dropped collection: ${collectionName}`);
      } else {
        console.log(`⚠️ Collection "${collectionName}" does not exist`);
      }
    } else {
      // No argument provided - drop the entire database
      await mongoose.connection.dropDatabase();
      console.log("🧹 Dropped entire database");
    }

    console.log("✅ Operation complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
}

resetDatabase();

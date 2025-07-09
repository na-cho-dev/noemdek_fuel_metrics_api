import mongoose from "mongoose";
import * as XLSX from "xlsx";
import path from "path";
import FuelModel from "../src/models/fuel.model";
import { config } from "../src/config";

async function importFuelData() {
  try {
    console.log("🔗 Connecting to:", config.MONGODB_URI);
    const db = await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Load Excel file
    const filePath = path.join(__dirname, "..", "fuel_data.xlsx");
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

    const fuelDocs = jsonData.map((row) => ({
      state: row["State"],
      period: new Date(row["Period"]),
      AGO: parseFloat(row["AGO"]),
      PMS: parseFloat(row["PMS"]),
      DPK: parseFloat(row["DPK"]),
      LPG: parseFloat(row["LPG"]),
      region: row["Region"],
    }));

    // Insert all data into DB
    await FuelModel.insertMany(fuelDocs);
    console.log(
      `✅ Successfully imported ${fuelDocs.length} fuel price records`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
}

importFuelData();

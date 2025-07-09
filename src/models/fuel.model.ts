import mongoose from "mongoose";
import { Region } from "../types/enums";

export interface FuelDocument extends mongoose.Document {
  state: string;
  region: string;
  period: Date;
  AGO: number; // Automotive Gas Oil (Diesel)
  PMS: number; // Premium Motor Spirit (Petrol)
  DPK: number; // Dual Purpose Kerosene
  LPG: number; // Liquefied Petroleum Gas (Cooking gas)
  createdAt: Date;
  updatedAt: Date;
}

const FuelSchema = new mongoose.Schema<FuelDocument>(
  {
    state: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      enum: Object.values(Region),
    },
    period: {
      type: Date,
      required: true,
    },
    AGO: {
      type: Number,
      required: true,
      min: 0,
    },
    PMS: {
      type: Number,
      required: true,
      min: 0,
    },
    DPK: {
      type: Number,
      required: true,
      min: 0,
    },
    LPG: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const FuelModel = mongoose.model<FuelDocument>("Fuel", FuelSchema);
export default FuelModel;

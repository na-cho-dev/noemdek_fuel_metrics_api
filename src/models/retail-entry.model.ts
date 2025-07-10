import mongoose from "mongoose";
import { FUEL_PRODUCTS, FuelProduct } from "../types/enums";

export interface RetailDataDocument extends mongoose.Document {
  fillingStation: string;
  state: string;
  lga?: string;
  city?: string;
  address?: string;
  product: FuelProduct;
  retailPrice: number;
  priceDate: Date;
  uploadedBy: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const RetailDataSchema = new mongoose.Schema<RetailDataDocument>(
  {
    fillingStation: { type: String, required: true },
    state: { type: String, required: true },
    lga: String,
    city: String,
    address: String,
    product: {
      type: String,
      enum: FUEL_PRODUCTS,
      required: true,
    },
    retailPrice: { type: Number, required: true },
    priceDate: { type: Date, required: true },
    uploadedBy: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const RetailDataModel = mongoose.model<RetailDataDocument>(
  "RetailData",
  RetailDataSchema
);

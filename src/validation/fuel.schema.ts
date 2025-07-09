import { z } from "zod";
import { Region } from "../types/enums";

export const FuelPriceSchema = z.object({
  state: z
    .string({ required_error: "State is required" })
    .min(2, "State must be at least 2 characters"),
  region: z.nativeEnum(Region, {
    required_error: "Region is required",
    invalid_type_error: "Invalid region",
  }),
  period: z
    .string({ required_error: "Period is required" })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Period must be a valid date string",
    }),
  AGO: z
    .number({ required_error: "AGO price is required" })
    .nonnegative("AGO must be >= 0"),
  PMS: z
    .number({ required_error: "PMS price is required" })
    .nonnegative("PMS must be >= 0"),
  DPK: z
    .number({ required_error: "DPK price is required" })
    .nonnegative("DPK must be >= 0"),
  LPG: z
    .number({ required_error: "LPG price is required" })
    .nonnegative("LPG must be >= 0"),
});

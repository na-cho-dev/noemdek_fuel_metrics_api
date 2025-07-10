import { Region } from "./enums";

export interface CreateFuelPriceDTO {
  state: string;
  region: Region;
  period: string | Date;
  AGO: number;
  PMS: number;
  DPK: number;
  LPG: number;
}

// Export as a type alias instead of empty interface
export type UpdateFuelPriceDTO = Partial<CreateFuelPriceDTO>;

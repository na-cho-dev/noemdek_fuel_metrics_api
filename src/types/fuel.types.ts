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

export interface UpdateFuelPriceDTO extends Partial<CreateFuelPriceDTO> {}

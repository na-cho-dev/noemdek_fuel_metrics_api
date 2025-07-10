import { FuelProduct } from "./enums";

export interface CreateRetailDataDTO {
  fillingStation: string;
  state: string;
  lga?: string;
  city?: string;
  address?: string;
  product: FuelProduct;
  retailPrice: number;
  priceDate: string | Date;
  uploadedBy: string;
}

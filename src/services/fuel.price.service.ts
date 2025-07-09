import FuelModel from "../models/fuel.model";
import { AppError } from "../errors/AppError";
import { CreateFuelPriceDTO, UpdateFuelPriceDTO } from "../types/fuel.types";

export class FuelPriceService {
  /**
   * Creates a new fuel price record.
   * @param data - The data for the new fuel price record.
   * @returns The created fuel price record.
   */
  static async createFuelPrice(data: CreateFuelPriceDTO) {
    return await FuelModel.create(data);
  }

  /**
   * Retrieves all fuel price records with pagination.
   * @param page - The page number for pagination.
   * @param limit - The number of records per page.
   * @returns An object containing the data and pagination info.
   */
  static async getAllFuelPrices(
    page: number,
    limit: number,
    filters: { state?: string; region?: string },
    sort: { field?: string; order?: "asc" | "desc" }
  ) {
    const query: any = {};

    if (filters.state) query.state = filters.state;
    if (filters.region) query.region = filters.region;

    const sortObj: any = {};
    if (sort.field) {
      sortObj[sort.field] = sort.order === "desc" ? -1 : 1;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      FuelModel.find(query).sort(sortObj).skip(skip).limit(limit),
      FuelModel.countDocuments(query),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  /**
   * Retrieves a specific fuel price record by ID.
   * @param id - The ID of the fuel price record.
   * @returns The fuel price record.
   * @throws AppError if the record is not found.
   */
  static async getFuelPriceById(id: string) {
    const entry = await FuelModel.findById(id);
    if (!entry) throw new AppError("Fuel price record not found", 404);
    return entry;
  }

  /**
   * Updates a specific fuel price record by ID.
   * @param id - The ID of the fuel price record.
   * @param updateData - The data to update the fuel price record.
   * @returns The updated fuel price record.
   * @throws AppError if the record is not found.
   */
  static async updateFuelPrice(id: string, updateData: UpdateFuelPriceDTO) {
    const updated = await FuelModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new AppError("Fuel price record not found", 404);
    return updated;
  }

  /**
   * Deletes a specific fuel price record by ID.
   * @param id - The ID of the fuel price record.
   * @returns The deleted fuel price record.
   * @throws AppError if the record is not found.
   */
  static async deleteFuelPrice(id: string) {
    const deleted = await FuelModel.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Fuel price record not found", 404);
    return deleted;
  }
}

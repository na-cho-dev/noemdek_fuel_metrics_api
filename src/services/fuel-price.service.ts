import FuelModel from "../models/fuel.model";
import { AppError } from "../errors/AppError";
import { CreateFuelPriceDTO, UpdateFuelPriceDTO } from "../types/fuel.types";
import { FUEL_PRODUCTS, FuelProduct } from "../types/enums";
import * as XLSX from "xlsx";
import { Parser } from "json2csv";

export class FuelPriceService {
  /**
   * Creates a new fuel price record.
   * @param data - The data for the new fuel price record.
   * @returns The created fuel price record.
   */
  static async createFuelRecord(data: CreateFuelPriceDTO) {
    return await FuelModel.create(data);
  }

  /**
   * Retrieves all fuel price records with pagination and filtering.
   * @param params - The query parameters for pagination, filtering, and sorting.
   * @returns An object containing paginated fuel price records and metadata.
   */
  static async getAll(params: {
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    order?: string;
    minPrice?: string;
    maxPrice?: string;
    product?: string;
    state?: string;
    region?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = "1",
      limit = "10",
      search = "",
      sortBy = "period",
      order = "desc",
      minPrice,
      maxPrice,
      product,
      state,
      region,
      startDate,
      endDate,
    } = params;

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);
    const sortDirection = order === "asc" ? 1 : -1;

    const query: any = {};

    if (search) {
      query.$or = [
        { state: { $regex: search, $options: "i" } },
        { region: { $regex: search, $options: "i" } },
      ];
    }

    // Add direct state filtering
    if (state) {
      query.state = { $regex: state, $options: "i" };
    }

    // Add direct region filtering
    if (region) {
      query.region = { $regex: region, $options: "i" };
    }

    // Add date range filtering
    if (startDate || endDate) {
      query.period = {};
      if (startDate) {
        query.period.$gte = new Date(startDate);
      }
      if (endDate) {
        query.period.$lte = new Date(endDate);
      }
    }

    if (product && FUEL_PRODUCTS.includes(product as FuelProduct)) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      if (Object.keys(priceFilter).length) {
        query[product] = priceFilter;
      }
    }

    const total = await FuelModel.countDocuments(query);
    const records = await FuelModel.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();

    return {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      records,
    };
  }

  /**
   * Retrieves filter options for fuel prices.
   * @returns An object containing available states, regions, products, and ranges.
   */
  static async getFilters() {
    const [states, regions, products] = await Promise.all([
      FuelModel.distinct("state"),
      FuelModel.distinct("region"),
      Promise.resolve(FUEL_PRODUCTS),
    ]);

    return {
      states,
      regions,
      products,
      ranges: ["7d", "30d", "90d", "180d", "1y", "all"],
    };
  }

  /**
   * Exports fuel price data in the specified format.
   * @param format - The format to export the data (csv or xlsx).
   * @returns An object containing the buffer, content type, and filename.
   * @throws AppError if the format is invalid or export fails.
   */
  static async exportData(format: string = "csv") {
    const fuels = await FuelModel.find().lean();

    if (format === "xlsx") {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(fuels);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Fuel Data");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      return {
        buffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: "fuel_data.xlsx",
      };
    }

    if (format === "csv") {
      const parser = new Parser();
      const csv = parser.parse(fuels);
      return {
        buffer: csv,
        contentType: "text/csv",
        filename: "fuel_data.csv",
      };
    }

    throw new Error("Unsupported format");
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

import { AppError } from "../errors/AppError";
import {
  RetailDataDocument,
  RetailDataModel,
} from "../models/retail-entry.model";
import { CreateRetailDataDTO } from "../types/retail-data.types";
import path from "path";
import XLSX from "xlsx";
import fs from "fs";

export class RetailDataService {
  /**
   * Retrieves all retail data based on provided filters and options.
   * @param {Object} filters - The filters to apply to the query.
   * @param {Object} options - The pagination and sorting options.
   * @param {number} options.page - The page number for pagination.
   * @param {number} options.limit - The number of records per page.
   * @param {string} options.sortBy - The field to sort by.
   * @param {string} options.order - The order of sorting, either 'asc' or 'desc'.
   * @returns {Promise<Object>} - An object containing the paginated results.
   */
  static async getAllRetailData(filters: any, options: any) {
    const {
      page = 1,
      limit = 10,
      sortBy = "priceDate",
      order = "desc",
    } = options;

    const query: any = {};

    if (filters.q) {
      const regex = new RegExp(filters.q, "i");
      query.$or = [
        { fillingStation: regex },
        { state: regex },
        { region: regex },
        { uploadedBy: regex },
      ];
    }

    if (filters.fillingStation) query.fillingStation = filters.fillingStation;
    if (filters.region) query.region = filters.region;
    if (filters.state) query.state = filters.state;
    if (filters.product) query.product = filters.product;
    if (filters.uploadedBy) query.uploadedBy = filters.uploadedBy;

    if (filters.from || filters.to) {
      query.priceDate = {};
      if (filters.from) query.priceDate.$gte = new Date(filters.from);
      if (filters.to) query.priceDate.$lte = new Date(filters.to);
    }

    const total = await RetailDataModel.countDocuments(query);

    const data = await RetailDataModel.find(query)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  /**
   * Uploads a single retail data entry.
   * @param {Object} payload - The retail data to upload.
   * @returns {Promise<RetailDataDocument>} - The created retail data entry.
   */
  static async uploadSingle(
    payload: CreateRetailDataDTO
  ): Promise<RetailDataDocument> {
    const { fillingStation, state, address, product, retailPrice } = payload;

    const exists = await RetailDataModel.findOne({
      fillingStation,
      state,
      address,
      product,
      retailPrice,
    });

    if (exists)
      throw new AppError(
        "Retail data already exists for this station, product, date, and state.",
        409
      );

    const data = {
      ...payload,
      status: "PENDING",
    };

    return await RetailDataModel.create(data);
  }

  static async bulkUpload(filePath: string, uploaderEmail: string) {
    const ext = path.extname(filePath).toLowerCase();

    if (![".xlsx", ".xls", ".csv"].includes(ext)) {
      throw new Error("Unsupported file format");
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsedData = XLSX.utils.sheet_to_json(sheet);

    const dataWithUser = parsedData.map((row: any) => ({
      ...row,
      uploadedBy: uploaderEmail,
      status: "PENDING",
    }));

    const inserted = await RetailDataModel.insertMany(dataWithUser);

    // Optionally delete the uploaded file
    fs.unlinkSync(filePath);

    return inserted;
  }

  static async approve(id: string) {
    const record = await RetailDataModel.findByIdAndUpdate(
      id,
      { status: "APPROVED", reviewedAt: new Date() },
      { new: true }
    );
    return record;
  }

  static async reject(id: string, reason: string) {
    const record = await RetailDataModel.findByIdAndUpdate(
      id,
      {
        status: "REJECTED",
        reviewedAt: new Date(),
        rejectionReason: reason || "No reason provided",
      },
      { new: true }
    );
    return record;
  }
}

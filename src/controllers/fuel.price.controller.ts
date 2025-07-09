import { Request, Response } from "express";
import { FuelPriceService } from "../services/fuel.price.service";
import { FuelPriceSchema } from "../validation/fuel.schema";
import FuelModel from "../models/fuel.model";

export class FuelPriceController {
  /**
   * Creates a new fuel price record.
   * @param req - The request object containing the fuel price data.
   * @param res - The response object to send the result.
   */
  static async create(req: Request, res: Response) {
    const parsed = FuelPriceSchema.parse(req.body);

    const fuel = await FuelPriceService.createFuelPrice(parsed);
    res.status(201).json({ success: true, data: fuel });
  }

  /**
   * Retrieves all fuel price records with pagination.
   * @param req - The request object containing pagination parameters.
   * @param res - The response object to send the result.
   */
  static async getAll(req: Request, res: Response) {
    const {
      page = "1",
      limit = "10",
      search = "",
      sortBy = "period", // or PMS, AGO, etc
      order = "desc",
      minPrice,
      maxPrice,
      product, // e.g., PMS, AGO
    } = req.query;

    const currentPage = parseInt(page as string);
    const perPage = parseInt(limit as string);
    const sortDirection = order === "asc" ? 1 : -1;

    const query: any = {};

    // Search
    if (search) {
      query.$or = [
        { state: { $regex: search, $options: "i" } },
        { region: { $regex: search, $options: "i" } },
      ];
    }

    // Product price filter
    if (product && ["PMS", "AGO", "DPK", "LPG"].includes(product as string)) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice as string);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice as string);
      if (Object.keys(priceFilter).length) {
        query[product as string] = priceFilter;
      }
    }

    const total = await FuelModel.countDocuments(query);

    const data = await FuelModel.find(query)
      .sort({ [sortBy as string]: sortDirection })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();

    res.status(200).json({
      success: true,
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      data,
    });
  }

  /**
   * Retrieves a specific fuel price record by ID.
   * @param req - The request object containing the fuel price ID.
   * @param res - The response object to send the result.
   */
  static async getById(req: Request, res: Response) {
    const id = req.params.id;
    const entry = await FuelPriceService.getFuelPriceById(id);
    res.status(200).json({ success: true, data: entry });
  }

  /**
   * Updates a specific fuel price record by ID.
   * @param req - The request object containing the fuel price ID and update data.
   * @param res - The response object to send the result.
   */
  static async update(req: Request, res: Response) {
    const id = req.params.id;

    const result = FuelPriceSchema.partial().parse(req.body);

    const updated = await FuelPriceService.updateFuelPrice(id, result);
    res.status(200).json({ success: true, data: updated });
  }

  /**
   * Deletes a specific fuel price record by ID.
   * @param req - The request object containing the fuel price ID.
   * @param res - The response object to send the result.
   */
  static async delete(req: Request, res: Response) {
    const id = req.params.id;
    await FuelPriceService.deleteFuelPrice(id);
    res.status(204).send();
  }
}

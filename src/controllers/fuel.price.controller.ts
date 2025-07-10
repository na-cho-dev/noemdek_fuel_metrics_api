import { Request, Response, NextFunction } from "express";
import { FuelPriceSchema } from "../validation/fuel.schema";
import { FuelPriceService } from "../services";

export class FuelPriceController {
  /**
   * Creates a new fuel price record.
   * @param req - The request object containing the fuel price data.
   * @param res - The response object to send the result.
   * @param next - The next function for error handling.
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = FuelPriceSchema.parse(req.body);

      const fuel = await FuelPriceService.createFuelRecord(parsed);
      res.status(201).json({ success: true, data: fuel });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Retrieves all fuel price records with pagination.
   * @param req - The request object containing pagination parameters.
   * @param res - The response object to send the result.
   * @param next - The next function for error handling.
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FuelPriceService.getAll(req.query);
      res.status(200).json({ success: true, data: { ...result } });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get filter options for fuel analysis.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The next function for error handling.
   */
  static async getFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = await FuelPriceService.getFilters();
      res.status(200).json({ success: true, data: { filters } });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Exports fuel data in CSV or XLSX format.
   * @param req - The request object containing the export format.
   * @param res - The response object to send the exported file.
   * @param next - The next function for error handling.
   */
  static async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const formatParam = (req.query.format as string)?.toLowerCase();
      const format = ["csv", "xlsx"].includes(formatParam)
        ? formatParam
        : "csv";

      if (formatParam && !["csv", "xlsx"].includes(formatParam)) {
        res.status(400).json({
          success: false,
          message: `Invalid format '${formatParam}'. Supported formats are: csv, xlsx. Using default format (csv).`,
        });
      }

      const { buffer, contentType, filename } =
        await FuelPriceService.exportData(format);

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.status(200).send(buffer);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Retrieves a specific fuel price record by ID.
   * @param req - The request object containing the fuel price ID.
   * @param res - The response object to send the result.
   * @param next - The next function for error handling.
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const entry = await FuelPriceService.getFuelPriceById(id);
      res.status(200).json({ success: true, data: entry });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Updates a specific fuel price record by ID.
   * @param req - The request object containing the fuel price ID and update data.
   * @param res - The response object to send the result.
   * @param next - The next function for error handling.
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      // Validate and parse the request body
      const result = FuelPriceSchema.partial().parse(req.body);

      const updated = await FuelPriceService.updateFuelPrice(id, result);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Deletes a specific fuel price record by ID.
   * @param req - The request object containing the fuel price ID.
   * @param res - The response object to send the result.
   * @param next - The next function for error handling.
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate the ID parameter
      const id = req.params.id;
      if (!id)
        res.status(400).json({ success: false, message: "ID is required" });

      // Attempt to delete the fuel price record
      await FuelPriceService.deleteFuelPrice(id);
      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }
}

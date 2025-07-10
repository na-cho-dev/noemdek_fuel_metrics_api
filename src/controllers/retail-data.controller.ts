import { NextFunction, Request, Response } from "express";
import { RetailDataService } from "../services";
import { RetailDataModel } from "../models/retail-entry.model";

export class RetailDataController {
  /**
   * Retrieves all retail data based on provided filters and options.
   * @param {Request} req - The request object containing query parameters.
   * @param {Response} res - The response object to send the results.
   * @returns {Promise<void>} - Sends a JSON response with the paginated results.
   */
  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "priceDate";
      const order = (req.query.order as string) || "desc";

      const result = await RetailDataService.getAllRetailData(filters, {
        page,
        limit,
        sortBy,
        order,
      });

      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Uploads a single retail data entry.
   * @param {Request} req - The request object containing the retail data to upload.
   * @param {Response} res - The response object to send the result.
   * @returns {Promise<void>} - Sends a JSON response with the status of the upload.
   */
  static async uploadSingle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user as { email: string }; // or whatever field you store
      const payload = {
        ...req.body,
        uploadedBy: user.email,
      };

      const saved = await RetailDataService.uploadSingle(payload);

      res.status(201).json({
        success: true,
        message: "Retail data uploaded and awaiting approval",
        data: saved,
      });
    } catch (error: any) {
      if (error.statusCode === 500) {
        res.status(500).json({
          success: false,
          message: "Upload failed",
        });
      } else {
        next(error);
      }
    }
  }

  /**
   * Uploads a summary of retail data entries.
   * @param {Request} req - The request object containing the file to upload.
   * @param {Response} res - The response object to send the result.
   * @returns {Promise<void>} - Sends a JSON response with the status of the upload.
   */
  static async bulkUpload(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const user = req.user as { email: string };
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    try {
      const inserted = await RetailDataService.bulkUpload(
        file.path,
        user.email
      );

      res.status(201).json({
        success: true,
        message: "Data uploaded successfully, awaiting approval",
        count: inserted.length,
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await RetailDataService.approve(id);

      if (!record)
        res.status(404).json({ success: false, message: "Record not found" });

      res
        .status(200)
        .json({ success: true, message: "Record approved", data: record });
    } catch (error: any) {
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const record = await RetailDataService.reject(id, reason);

      if (!record)
        res.status(404).json({ success: false, message: "Record not found" });

      res
        .status(200)
        .json({ success: true, message: "Record rejected", data: record });
    } catch (error: any) {
      next(error);
    }
  }
}

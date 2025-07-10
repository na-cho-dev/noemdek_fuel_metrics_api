import { NextFunction, Request, Response } from "express";
import { FuelProduct, FUEL_PRODUCTS } from "../types/enums";
import { FuelAnalysisService } from "../services";

export class FuelAnalysisController {
  /**
   * Get the summary of fuel prices with changes.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const products: FuelProduct[] = FUEL_PRODUCTS;
      const summary = await Promise.all(
        products.map((product) =>
          FuelAnalysisService.getSummaryWithChange(product)
        )
      );

      res.status(200).json({
        success: true,
        data: summary.filter(Boolean),
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get the national average fuel prices.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getAllTimeNationalAverage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await FuelAnalysisService.getAllTimeNationalAverage();
      res.status(200).json({ success: true, data: data[0] });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get the average fuel prices by region.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getAverageByRegion(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await FuelAnalysisService.getAverageByRegion();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get the top states by fuel product price.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getTopStatesByProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { product } = req.params;
      const { order = "desc" } = req.query;
      const data = await FuelAnalysisService.getTopStatesByProduct(
        product.toUpperCase(),
        order === "asc" ? "asc" : "desc"
      );
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get fuel price trends for a specific state and product.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const { product, state, region, range } = req.query as {
        product: string;
        state: string;
        region: string;
        range: string;
      };

      if (!product || !FUEL_PRODUCTS.includes(product as FuelProduct)) {
        res.status(400).json({
          success: false,
          message: "Invalid or missing product type",
        });
      }

      const trend = await FuelAnalysisService.getTrends(
        product,
        state,
        region,
        range ?? "30d"
      );

      res.status(200).json({
        success: true,
        data: {
          filters: {
            product,
            state: state || null,
            region: region || null,
            range: range || "30d",
          },
          trend,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get mini trend data for a specific state and product.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getMiniTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const { state, product } = req.query as {
        state: string;
        product: string;
      };

      if (!state || !product)
        res
          .status(400)
          .json({ success: false, message: "state and product are required" });

      if (!FUEL_PRODUCTS.includes(product as FuelProduct))
        res
          .status(400)
          .json({ success: false, message: "Invalid product type" });

      const trend = await FuelAnalysisService.getMiniTrend(state, product);
      res.status(200).json({
        success: true,
        data: {
          state,
          product,
          trend,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get the price change for a specific product in a state over a given range.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getPriceChange(req: Request, res: Response, next: NextFunction) {
    try {
      const { state, product, range = "7d" } = req.query;

      if (!state || !product) {
        res
          .status(400)
          .json({ success: false, message: "state and product are required" });
      }

      const validProducts: FuelProduct[] = FUEL_PRODUCTS;
      if (!validProducts.includes(product as FuelProduct)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid product type" });
      }

      const days = parseInt((range as string).replace("d", "")) || 7;

      const result = await FuelAnalysisService.getPriceChange(
        state as string,
        product as string,
        days
      );

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Insufficient data to calculate change",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          state,
          product,
          range,
          ...result,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get the weekly report for a specific product.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getWeeklyReport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const product = req.query.product as string;

      if (!product)
        res
          .status(400)
          .json({ success: false, message: "Product is required" });

      const report = await FuelAnalysisService.getWeeklyReport(product);
      res.status(200).json({
        success: true,
        data: {
          product,
          report,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
}

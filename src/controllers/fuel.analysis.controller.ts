import { Request, Response } from "express";
import { FuelAnalysisService } from "../services/fuel.analysis.service";
import { FuelProduct } from "../types/enums";

export class FuelAnalysisController {
  /**
   * Get the summary of fuel prices with changes.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getSummary(req: Request, res: Response) {
    const products: FuelProduct[] = [
      FuelProduct.PMS,
      FuelProduct.AGO,
      FuelProduct.DPK,
      FuelProduct.LPG,
    ];
    const summary = await Promise.all(
      products.map((product) =>
        FuelAnalysisService.getSummaryWithChange(product)
      )
    );

    res.status(200).json({
      success: true,
      data: summary.filter(Boolean),
    });
  }
  /**
   * Get the national average fuel prices.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getAllTimeNationalAverage(req: Request, res: Response) {
    const data = await FuelAnalysisService.getAllTimeNationalAverage();
    res.status(200).json({ success: true, data: data[0] });
  }

  /**
   * Get the average fuel prices by region.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getAverageByRegion(req: Request, res: Response) {
    const data = await FuelAnalysisService.getAverageByRegion();
    res.status(200).json({ success: true, data });
  }

  /**
   * Get the top states by fuel product price.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getTopStatesByProduct(req: Request, res: Response) {
    const { product } = req.params;
    const { order = "desc" } = req.query;
    const data = await FuelAnalysisService.getTopStatesByProduct(
      product.toUpperCase(),
      order === "asc" ? "asc" : "desc"
    );
    res.status(200).json({ success: true, data });
  }

  /**
   * Get fuel price trends for a specific state and product.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getTrends(req: Request, res: Response) {
    const { product, state, region, range } = req.query as {
      product: string;
      state: string;
      region: string;
      range: string;
    };

    const validProducts = ["PMS", "AGO", "DPK", "LPG"];
    if (!product || !validProducts.includes(product)) {
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
      filters: {
        product,
        state: state || null,
        region: region || null,
        range: range || "30d",
      },
      trend,
    });
  }

  /**
   * Get mini trend data for a specific state and product.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getMiniTrend(req: Request, res: Response) {
    const { state, product } = req.query as {
      state: string;
      product: string;
    };

    if (!state || !product)
      res
        .status(400)
        .json({ success: false, message: "state and product are required" });

    const validProducts = ["PMS", "AGO", "DPK", "LPG"];
    if (!validProducts.includes(product))
      res.status(400).json({ success: false, message: "Invalid product type" });

    const trend = await FuelAnalysisService.getMiniTrend(state, product);
    res.status(200).json({
      success: true,
      state,
      product,
      trend,
    });
  }

  static async getPriceChange(req: Request, res: Response) {
    const { state, product, range = "7d" } = req.query;

    if (!state || !product) {
      res
        .status(400)
        .json({ success: false, message: "state and product are required" });
    }

    const validProducts = ["PMS", "AGO", "DPK", "LPG"];
    if (!validProducts.includes(product as string)) {
      res.status(400).json({ success: false, message: "Invalid product type" });
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
      state,
      product,
      range,
      ...result,
    });
  }

  static async getWeeklyReport(req: Request, res: Response) {
    const product = req.query.product as string;

    if (!product)
      res.status(400).json({ success: false, message: "Product is required" });

    const report = await FuelAnalysisService.getWeeklyReport(product);
    res.status(200).json({
      success: true,
      product,
      report,
    });
  }
}

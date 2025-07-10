import { AppError } from "../errors/AppError";
import FuelModel from "../models/fuel.model";
import { FuelProduct, FUEL_PRODUCTS } from "../types/enums";
import { getStartDateFromRange } from "../utils/date-range";

export class FuelAnalysisService {
  /**
   * Get the summary of fuel prices with changes.
   * @param product - The fuel product to analyze.
   * @returns An object containing the current and previous prices, change, and trend direction.
   */
  static async getSummaryWithChange(product: FuelProduct) {
    const [latest, previous] = await FuelModel.find({
      [product]: { $ne: null },
    })
      .sort({ period: -1 })
      .limit(2)
      .lean();

    if (!latest || !previous) return null;

    const current = latest[product] as number;
    const prev = previous[product] as number;

    const valueChange = current - prev;
    const percentageChange = (valueChange / prev) * 100;
    const trendDirection =
      valueChange > 0 ? "up" : valueChange < 0 ? "down" : "no-change";

    return {
      product,
      currentPrice: current,
      previousPrice: prev,
      valueChange: +valueChange.toFixed(2),
      percentageChange: +percentageChange.toFixed(2),
      trendDirection,
    };
  }

  /**
   * Get the all-time national average fuel prices.
   * @return An object containing the average prices for each fuel product.
   */
  static async getAllTimeNationalAverage() {
    return FuelModel.aggregate([
      {
        $group: {
          _id: null,
          avgAGO: { $avg: "$AGO" },
          avgPMS: { $avg: "$PMS" },
          avgDPK: { $avg: "$DPK" },
          avgLPG: { $avg: "$LPG" },
        },
      },
      { $project: { _id: 0 } },
    ]);
  }

  /**
   * Get the average fuel prices by region.
   * @return An array of objects containing the average prices for each region.
   */
  static async getAverageByRegion() {
    return FuelModel.aggregate([
      {
        $group: {
          _id: "$region",
          avgAGO: { $avg: "$AGO" },
          avgPMS: { $avg: "$PMS" },
          avgDPK: { $avg: "$DPK" },
          avgLPG: { $avg: "$LPG" },
        },
      },
      {
        $project: {
          region: "$_id",
          _id: 0,
          avgAGO: 1,
          avgPMS: 1,
          avgDPK: 1,
          avgLPG: 1,
        },
      },
    ]);
  }

  /**
   * Get the top states by fuel product price.
   * @param product - The fuel product to analyze.
   * @param order - The sort order (asc or desc).
   * @returns An array of objects containing the top states and their average prices.
   */
  static async getTopStatesByProduct(
    product: string,
    order: "asc" | "desc" = "desc"
  ) {
    const sortOrder = order === "asc" ? 1 : -1;

    if (!FUEL_PRODUCTS.includes(product as FuelProduct)) {
      throw new AppError("Invalid product type", 400);
    }

    return FuelModel.aggregate([
      {
        $group: {
          _id: "$state",
          value: { $avg: `$${product}` },
        },
      },
      { $sort: { value: sortOrder } },
      { $limit: 5 },
      { $project: { state: "$_id", value: 1, _id: 0 } },
    ]);
  }

  /**
   * Get fuel price trends for a specific state and product.
   * @param product - The fuel product to analyze.
   * @param state - The state to filter by.
   * @param region - The region to filter by (optional).
   * @param range - The date range for the trend (default is "30d").
   * @returns An array of objects containing the date and average price.
   */
  static async getTrends(
    product: string,
    state?: string,
    region?: string,
    range: string = "30d"
  ) {
    const startDate = getStartDateFromRange(range);

    const match: any = {
      period: { $gte: startDate },
    };

    if (state) match.state = state;
    else if (region) match.region = region;

    const prices = await FuelModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$period",
          price: { $avg: `$${product}` },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trend = prices.map((entry) => ({
      date: entry._id.toISOString().split("T")[0],
      price: parseFloat(entry.price.toFixed(2)),
    }));

    return trend;
  }

  /**
   * Get the mini trend for a specific state and product.
   * @param state - The state to filter by.
   * @param product - The fuel product to analyze.
   * @returns An array of objects containing the date and price for the last 7 days.
   */
  static async getMiniTrend(state: string, product: string) {
    const trendData = await FuelModel.find({ state })
      .sort({ period: -1 })
      .limit(7)
      .select({ period: 1, [product]: 1 })
      .lean();

    // Reverse to chronological order
    return trendData.reverse().map((entry) => ({
      period: entry.period.toISOString().split("T")[0],
      price: entry[product as keyof typeof entry] as number,
    }));
  }

  /**
   * Get the price change for a specific fuel product.
   * @param state - The state to filter by.
   * @param product - The fuel product to analyze.
   * @param range - The date range for the analysis (in days).
   * @returns An object containing the current price, previous price, change, and percentage change.
   */
  static async getPriceChange(state: string, product: string, range: number) {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - range);

    const [latest, previous] = await Promise.all([
      FuelModel.findOne({ state })
        .sort({ period: -1 })
        .select({ period: 1, [product]: 1 })
        .lean(),
      FuelModel.findOne({ state, period: { $lte: pastDate } })
        .sort({ period: -1 })
        .select({ period: 1, [product]: 1 })
        .lean(),
    ]);

    if (!latest || !previous) return null;

    const currentPrice = latest[product as keyof typeof latest] as number;
    const previousPrice = previous[product as keyof typeof previous] as number;
    const change = currentPrice - previousPrice;
    const percentageChange = (change / previousPrice) * 100;

    return {
      currentPrice,
      previousPrice,
      change: parseFloat(change.toFixed(2)),
      percentageChange: parseFloat(percentageChange.toFixed(2)),
    };
  }

  /**
   * Get the weekly report for a specific fuel product.
   * @param product - The fuel product to analyze.
   * @returns An array of objects containing the state, current price, previous price, change, percentage change, and trend.
   */
  static async getWeeklyReport(product: string) {
    if (!FUEL_PRODUCTS.includes(product as FuelProduct)) return [];

    const states = await FuelModel.distinct("state");

    const report = await Promise.all(
      states.map(async (state) => {
        const records = await FuelModel.find({ state })
          .sort({ period: -1 })
          .limit(7)
          .select({ period: 1, [product]: 1 })
          .lean();

        if (records.length < 2) return null;

        const trend = records.map(
          (r) => r[product as keyof typeof r]
        ) as number[];

        const currentPrice = trend[0];
        const previousPrice = trend[trend.length - 1];
        const change = currentPrice - previousPrice;
        const percentageChange = (change / previousPrice) * 100;

        return {
          state,
          currentPrice,
          previousPrice,
          change: +change.toFixed(2),
          percentageChange: +percentageChange.toFixed(2),
          trend: trend.reverse(),
        };
      })
    );

    return report.filter(Boolean); // remove nulls
  }
}

import { AppError } from "../errors/AppError";
import FuelModel from "../models/fuel.model";
import { FuelProduct } from "../types/enums";
import { getStartDateFromRange } from "../utils/dateRange";

export class FuelAnalysisService {
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

  static async getTopStatesByProduct(
    product: string,
    order: "asc" | "desc" = "desc"
  ) {
    const sortOrder = order === "asc" ? 1 : -1;
    const validProducts = ["AGO", "PMS", "DPK", "LPG"];

    if (!validProducts.includes(product)) {
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

  static async getWeeklyReport(product: string) {
    const validProducts = ["PMS", "AGO", "DPK", "LPG"];
    if (!validProducts.includes(product)) return [];

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

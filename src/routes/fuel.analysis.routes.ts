import { Router } from "express";
import { FuelAnalysisController } from "../controllers/fuel.analysis.controller";
import { authMiddleware } from "../middleware";

const fuelAnalysisRouter: Router = Router();

fuelAnalysisRouter.use(authMiddleware.authenticate);

// Get the summary of fuel prices with changes
fuelAnalysisRouter.get(
  "/summary",
  FuelAnalysisController.getSummary
);

// Get the national average fuel prices
fuelAnalysisRouter.get(
  "/average/all-time",
  FuelAnalysisController.getAllTimeNationalAverage
);

// Get the average fuel prices by region
fuelAnalysisRouter.get(
  "/average-by-region",
  FuelAnalysisController.getAverageByRegion
);

// Get the top states by fuel product price
fuelAnalysisRouter.get(
  "/top/:product",
  FuelAnalysisController.getTopStatesByProduct
);

// Get the weekly report for a specific fuel product
fuelAnalysisRouter.get("/trends", FuelAnalysisController.getTrends);

// Get the weekly report for a specific fuel product
fuelAnalysisRouter.get("/mini-trend", FuelAnalysisController.getMiniTrend);

// Get the price change for a specific fuel product
fuelAnalysisRouter.get("/price-change", FuelAnalysisController.getPriceChange);

// Get the weekly report for a specific fuel product
fuelAnalysisRouter.get(
  "/weekly-report",
  FuelAnalysisController.getWeeklyReport
);

export default fuelAnalysisRouter;

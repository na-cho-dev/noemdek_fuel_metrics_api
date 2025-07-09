import { Router } from "express";
import { FuelAnalysisController } from "../controllers/fuel.analysis.controller";
import { authMiddleware } from "../middleware";

const fuelAnalysisRouter: Router = Router();

fuelAnalysisRouter.use(authMiddleware.authenticate);

fuelAnalysisRouter.get(
  "/summary",
  FuelAnalysisController.getSummary
);
fuelAnalysisRouter.get(
  "/average/all-time",
  FuelAnalysisController.getAllTimeNationalAverage
);
fuelAnalysisRouter.get(
  "/average-by-region",
  FuelAnalysisController.getAverageByRegion
);
fuelAnalysisRouter.get(
  "/top/:product",
  FuelAnalysisController.getTopStatesByProduct
);
fuelAnalysisRouter.get("/trends", FuelAnalysisController.getTrends);
fuelAnalysisRouter.get("/mini-trend", FuelAnalysisController.getMiniTrend);
fuelAnalysisRouter.get("/price-change", FuelAnalysisController.getPriceChange);
fuelAnalysisRouter.get(
  "/weekly-report",
  FuelAnalysisController.getWeeklyReport
);

export default fuelAnalysisRouter;

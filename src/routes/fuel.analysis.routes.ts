import { Router } from "express";
import { FuelAnalysisController } from "../controllers/fuel.analysis.controller";
import { authMiddleware } from "../middleware";

const fuelAnalysisRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Fuel Analysis
 *   description: Fuel price analytics and reporting endpoints
 */

fuelAnalysisRouter.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/fuel-analysis/summary:
 *   get:
 *     summary: Get summary of fuel prices with price changes
 *     tags: [Fuel Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fuel price summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         description: Fuel product name
 *                       currentPrice:
 *                         type: number
 *                         description: Current average price
 *                       previousPrice:
 *                         type: number
 *                         description: Previous period price
 *                       change:
 *                         type: number
 *                         description: Price change amount
 *                       changePercentage:
 *                         type: number
 *                         description: Price change percentage
 *                       trendDirection:
 *                         type: string
 *                         enum: [up, down, no-change]
 *                         description: Price trend direction
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelAnalysisRouter.get("/summary", FuelAnalysisController.getSummary);

/**
 * @swagger
 * /api/fuel-analysis/average/all-time:
 *   get:
 *     summary: Get national average fuel prices across all time periods
 *     tags: [Fuel Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: National averages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     avgPMS:
 *                       type: number
 *                       description: Average PMS price
 *                     avgAGO:
 *                       type: number
 *                       description: Average AGO price
 *                     avgDPK:
 *                       type: number
 *                       description: Average DPK price
 *                     avgLPG:
 *                       type: number
 *                       description: Average LPG price
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelAnalysisRouter.get(
  "/average/all-time",
  FuelAnalysisController.getAllTimeNationalAverage
);

/**
 * @swagger
 * /api/fuel-analysis/average-by-region:
 *   get:
 *     summary: Get average fuel prices grouped by region
 *     tags: [Fuel Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Regional averages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       region:
 *                         type: string
 *                         description: Region name
 *                       avgPMS:
 *                         type: number
 *                         description: Average PMS price for the region
 *                       avgAGO:
 *                         type: number
 *                         description: Average AGO price for the region
 *                       avgDPK:
 *                         type: number
 *                         description: Average DPK price for the region
 *                       avgLPG:
 *                         type: number
 *                         description: Average LPG price for the region
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelAnalysisRouter.get(
  "/average-by-region",
  FuelAnalysisController.getAverageByRegion
);

/**
 * @swagger
 * /api/fuel-analysis/top/{product}:
 *   get:
 *     summary: Get top states by fuel product price
 *     tags: [Fuel Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PMS, AGO, DPK, LPG]
 *         description: Fuel product type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 5
 *         description: Number of top states to return
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (desc for highest prices, asc for lowest)
 *     responses:
 *       200:
 *         description: Top states retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       state:
 *                         type: string
 *                         description: State name
 *                       value:
 *                         type: number
 *                         description: Average price for the product
 *       400:
 *         description: Invalid product parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelAnalysisRouter.get(
  "/top/:product",
  FuelAnalysisController.getTopStatesByProduct
);

/**
 * @swagger
 * /api/fuel-analysis/trends:
 *   get:
 *     summary: Get price trends for a specific fuel product over time
 *     tags: [Fuel Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PMS, AGO, DPK, LPG]
 *         description: Fuel product type
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Time range for trend analysis
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by specific state
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum: [SOUTH_WEST, SOUTH_EAST, SOUTH_SOUTH, NORTH_CENTRAL, NORTH_EAST, NORTH_WEST]
 *         description: Filter by specific region
 *     responses:
 *       200:
 *         description: Price trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     trend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             format: date
 *                           price:
 *                             type: number
 *                           change:
 *                             type: number
 *                     filters:
 *                       type: object
 *                       properties:
 *                         product:
 *                           type: string
 *                         range:
 *                           type: string
 *                         state:
 *                           type: string
 *                         region:
 *                           type: string
 *       400:
 *         description: Invalid or missing product type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelAnalysisRouter.get("/trends", FuelAnalysisController.getTrends);

/**
 * @swagger
 * /api/fuel-analysis/mini-trend:
 *   get:
 *     summary: Get mini trend data for dashboard widgets
 *     tags: [Fuel Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State name for trend analysis
 *       - in: query
 *         name: product
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PMS, AGO, DPK, LPG]
 *         description: Fuel product type
 *     responses:
 *       200:
 *         description: Mini trend data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                       description: Current price
 *                     previous:
 *                       type: number
 *                       description: Previous price
 *                     change:
 *                       type: number
 *                       description: Price change
 *                     changePercentage:
 *                       type: number
 *                       description: Price change percentage
 *                     trend:
 *                       type: string
 *                       enum: [up, down, stable]
 *                       description: Trend direction
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelAnalysisRouter.get("/mini-trend", FuelAnalysisController.getMiniTrend);

/**
 * @swagger
 * /api/fuel-analysis/price-change:
 *   get:
 *     summary: Get price change analysis for a specific state and product
 *     tags: [Fuel Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State name for price change analysis
 *       - in: query
 *         name: product
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PMS, AGO, DPK, LPG]
 *         description: Fuel product type
 *     responses:
 *       200:
 *         description: Price change data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     state:
 *                       type: string
 *                       description: State name
 *                     product:
 *                       type: string
 *                       description: Product name
 *                     currentPrice:
 *                       type: number
 *                       description: Current price
 *                     previousPrice:
 *                       type: number
 *                       description: Previous price
 *                     change:
 *                       type: number
 *                       description: Price change amount
 *                     changePercentage:
 *                       type: number
 *                       description: Price change percentage
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Insufficient data to calculate change
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelAnalysisRouter.get("/price-change", FuelAnalysisController.getPriceChange);

/**
 * @swagger
 * /api/fuel-analysis/weekly-report:
 *   get:
 *     summary: Get weekly price report for a specific fuel product
 *     tags: [Fuel Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PMS, AGO, DPK, LPG]
 *         description: Fuel product type
 *     responses:
 *       200:
 *         description: Weekly report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: Product name
 *                     report:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           state:
 *                             type: string
 *                             description: State name
 *                           region:
 *                             type: string
 *                             description: Region name
 *                           currentPrice:
 *                             type: number
 *                             description: Current week price
 *                           previousPrice:
 *                             type: number
 *                             description: Previous week price
 *                           change:
 *                             type: number
 *                             description: Week-over-week change
 *                           changePercentage:
 *                             type: number
 *                             description: Week-over-week change percentage
 *                           trend:
 *                             type: string
 *                             enum: [up, down, stable]
 *                             description: Price trend indicator
 *       400:
 *         description: Product is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelAnalysisRouter.get(
  "/weekly-report",
  FuelAnalysisController.getWeeklyReport
);

export default fuelAnalysisRouter;

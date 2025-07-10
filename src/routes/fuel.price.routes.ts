import { Router } from "express";
import { authMiddleware } from "../middleware";
import { FuelPriceController } from "../controllers/fuel.price.controller";

const fuelPriceRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Fuel Prices
 *   description: Fuel price management endpoints
 */

// Secure all routes with authentication middleware
fuelPriceRouter.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/fuel:
 *   post:
 *     summary: Create a new fuel price record
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FuelPriceRequest'
 *           example:
 *             state: "Lagos"
 *             region: "SOUTH_WEST"
 *             period: "2024-01-15"
 *             PMS: 617.50
 *             AGO: 780.00
 *             DPK: 650.00
 *             LPG: 1250.00
 *     responses:
 *       201:
 *         description: Fuel price record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Fuel price record created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/FuelPrice'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelPriceRouter.post("/", FuelPriceController.create);

/**
 * @swagger
 * /api/fuel:
 *   get:
 *     summary: Get all fuel price records with filtering and pagination
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by state or region name
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records until this date (YYYY-MM-DD)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [period, PMS, AGO, DPK, LPG, state, region]
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Fuel price records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelPriceRouter.get("/", FuelPriceController.getAll);

/**
 * @swagger
 * /api/fuel/filters:
 *   get:
 *     summary: Get available filter options for fuel prices
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filter options retrieved successfully
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
 *                     filters:
 *                       type: object
 *                       properties:
 *                         states:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Available states
 *                         regions:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Available regions
 *                         products:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Available fuel products
 *                         ranges:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Available date ranges
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelPriceRouter.get("/filters", FuelPriceController.getFilters);

/**
 * @swagger
 * /api/fuel/export:
 *   get:
 *     summary: Export fuel price data
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *           default: csv
 *         description: Export format
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by specific state
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by specific region
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records until this date
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelPriceRouter.get("/export", FuelPriceController.exportData);

/**
 * @swagger
 * /api/fuel/{id}:
 *   get:
 *     summary: Get a specific fuel price record by ID
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fuel price record ID
 *     responses:
 *       200:
 *         description: Fuel price record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FuelPrice'
 *       400:
 *         description: Invalid ID format
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
 *         description: Fuel price record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelPriceRouter.get("/:id", FuelPriceController.getById);

/**
 * @swagger
 * /api/fuel/{id}:
 *   put:
 *     summary: Update a specific fuel price record
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fuel price record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 minLength: 2
 *               region:
 *                 type: string
 *                 enum: [SOUTH_WEST, SOUTH_EAST, SOUTH_SOUTH, NORTH_CENTRAL, NORTH_EAST, NORTH_WEST]
 *               period:
 *                 type: string
 *                 format: date
 *               PMS:
 *                 type: number
 *                 minimum: 0
 *               AGO:
 *                 type: number
 *                 minimum: 0
 *               DPK:
 *                 type: number
 *                 minimum: 0
 *               LPG:
 *                 type: number
 *                 minimum: 0
 *           example:
 *             state: "Lagos"
 *             PMS: 625.00
 *             AGO: 790.00
 *     responses:
 *       200:
 *         description: Fuel price record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Fuel price record updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/FuelPrice'
 *       400:
 *         description: Invalid ID format or validation error
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
 *         description: Fuel price record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelPriceRouter.put("/:id", FuelPriceController.update);

/**
 * @swagger
 * /api/fuel/{id}:
 *   delete:
 *     summary: Delete a specific fuel price record
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fuel price record ID
 *     responses:
 *       204:
 *         description: Fuel price record deleted successfully
 *       400:
 *         description: Invalid ID format
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
 *         description: Fuel price record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
fuelPriceRouter.delete("/:id", FuelPriceController.delete);

export default fuelPriceRouter;

import { Router } from "express";
import { RetailDataController } from "../controllers/retail-data.controller";
import { authMiddleware } from "../middleware";
import upload from "../middleware/upload.middleware";

const retailDataRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Retail Data
 *   description: Retail fuel data management endpoints
 */

// Secure all routes with authentication middleware
retailDataRouter.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/retail-data:
 *   post:
 *     summary: Upload a single retail data entry
 *     tags: [Retail Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - retailerName
 *               - location
 *               - fuelType
 *               - price
 *               - date
 *             properties:
 *               retailerName:
 *                 type: string
 *                 description: Name of the retailer
 *               location:
 *                 type: string
 *                 description: Location of the retail station
 *               fuelType:
 *                 type: string
 *                 enum: [PMS, AGO, DPK, LPG]
 *                 description: Type of fuel
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Price per liter/kg
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of price recording
 *     responses:
 *       201:
 *         description: Retail data entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
retailDataRouter.post("/", RetailDataController.uploadSingle);

/**
 * @swagger
 * /api/retail-data/bulk:
 *   post:
 *     summary: Upload retail data in bulk via file upload
 *     tags: [Retail Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel or CSV file containing retail data
 *     responses:
 *       201:
 *         description: Bulk upload completed successfully
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
 *                   example: "Bulk upload completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: number
 *                       description: Number of records processed
 *                     successful:
 *                       type: number
 *                       description: Number of records successfully imported
 *                     failed:
 *                       type: number
 *                       description: Number of records that failed
 *       400:
 *         description: File validation error or processing error
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
retailDataRouter.post(
  "/bulk",
  upload.single("file"),
  RetailDataController.bulkUpload
);

/**
 * @swagger
 * /api/retail-data:
 *   get:
 *     summary: Get all retail data entries with filtering and pagination
 *     tags: [Retail Data]
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
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: fuelType
 *         schema:
 *           type: string
 *           enum: [PMS, AGO, DPK, LPG]
 *         description: Filter by fuel type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by approval status
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
 *         description: Retail data entries retrieved successfully
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
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           retailerName:
 *                             type: string
 *                           location:
 *                             type: string
 *                           fuelType:
 *                             type: string
 *                           price:
 *                             type: number
 *                           date:
 *                             type: string
 *                             format: date
 *                           status:
 *                             type: string
 *                             enum: [pending, approved, rejected]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
retailDataRouter.get("/", RetailDataController.getAll);

/**
 * @swagger
 * /api/retail-data/{id}/approve:
 *   put:
 *     summary: Approve a retail data entry
 *     tags: [Retail Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Retail data entry ID
 *     responses:
 *       200:
 *         description: Retail data entry approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *         description: Retail data entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
retailDataRouter.put("/:id/approve", RetailDataController.approve);

/**
 * @swagger
 * /api/retail-data/{id}/reject:
 *   put:
 *     summary: Reject a retail data entry
 *     tags: [Retail Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Retail data entry ID
 *     responses:
 *       200:
 *         description: Retail data entry rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *         description: Retail data entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
retailDataRouter.put("/:id/reject", RetailDataController.reject);

export default retailDataRouter;

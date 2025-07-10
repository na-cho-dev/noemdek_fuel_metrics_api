import { Router } from "express";
import { authMiddleware } from "../middleware";
import { FuelPriceController } from "../controllers/fuel.price.controller";

const fuelPriceRouter: Router = Router();

// Secure all routes with authentication middleware
fuelPriceRouter.use(authMiddleware.authenticate);

// Create a new fuel price record
fuelPriceRouter.post("/", FuelPriceController.create);

// Get all fuel price records (paginated)
fuelPriceRouter.get("/", FuelPriceController.getAll);

// Get filter options for fuel prices
fuelPriceRouter.get("/filters", FuelPriceController.getFilters);

// Export fuel price data
fuelPriceRouter.get("/export", FuelPriceController.exportData);

// Get a specific fuel price record by ID
fuelPriceRouter.get("/:id", FuelPriceController.getById);

// Update a specific fuel price record
fuelPriceRouter.put("/:id", FuelPriceController.update);

// Delete a specific fuel price record
fuelPriceRouter.delete("/:id", FuelPriceController.delete);

export default fuelPriceRouter;

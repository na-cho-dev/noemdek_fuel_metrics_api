import { Router } from "express";
import { RetailDataController } from "../controllers/retail-data.controller";
import { authMiddleware } from "../middleware";
import upload from "../middleware/upload.middleware";

const retailDataRouter: Router = Router();

// Secure all routes with authentication middleware
retailDataRouter.use(authMiddleware.authenticate);

// Route to upload a single retail data entry
retailDataRouter.post("/", RetailDataController.uploadSingle);

// Route to upload a summary file
retailDataRouter.post(
  "/bulk",
  upload.single("file"),
  RetailDataController.bulkUpload
);

// Route to get all retail data entries with optional filters and pagination
retailDataRouter.get("/", RetailDataController.getAll);

retailDataRouter.put("/:id/approve", RetailDataController.approve);
retailDataRouter.put("/:id/reject", RetailDataController.reject);

export default retailDataRouter;

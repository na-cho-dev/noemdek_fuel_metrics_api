import { Request, Response, NextFunction } from "express";
import { RetailDataController } from "../controllers/retail-data.controller";
import { RetailDataService } from "../services";

// Mock the service
jest.mock("../services", () => ({
  RetailDataService: {
    getAllRetailData: jest.fn(),
    uploadSingle: jest.fn(),
    bulkUpload: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  },
}));

describe("RetailDataController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
      params: {},
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        isVerified: true,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should get all retail data with default pagination", async () => {
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
      (RetailDataService.getAllRetailData as jest.Mock).mockResolvedValue(
        mockResult
      );

      await RetailDataController.getAll(req as Request, res as Response, next);

      expect(RetailDataService.getAllRetailData).toHaveBeenCalledWith(
        {},
        {
          page: 1,
          limit: 10,
          sortBy: "priceDate",
          order: "desc",
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult,
      });
    });

    it("should get all retail data with custom pagination", async () => {
      req.query = { page: "2", limit: "20", sortBy: "state", order: "asc" };
      const mockResult = {
        data: [],
        pagination: { page: 2, limit: 20, total: 0 },
      };
      (RetailDataService.getAllRetailData as jest.Mock).mockResolvedValue(
        mockResult
      );

      await RetailDataController.getAll(req as Request, res as Response, next);

      expect(RetailDataService.getAllRetailData).toHaveBeenCalledWith(
        req.query,
        {
          page: 2,
          limit: 20,
          sortBy: "state",
          order: "asc",
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      (RetailDataService.getAllRetailData as jest.Mock).mockRejectedValue(
        error
      );

      await RetailDataController.getAll(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("uploadSingle", () => {
    it("should upload single retail data successfully", async () => {
      const mockData = { id: "1", state: "Lagos", product: "PMS", price: 617 };
      req.body = mockData;
      (RetailDataService.uploadSingle as jest.Mock).mockResolvedValue(mockData);

      await RetailDataController.uploadSingle(
        req as Request,
        res as Response,
        next
      );

      expect(RetailDataService.uploadSingle).toHaveBeenCalledWith({
        ...mockData,
        uploadedBy: "test@example.com",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Retail data uploaded and awaiting approval",
        data: mockData,
      });
    });

    it("should handle 500 error", async () => {
      const error = { statusCode: 500 };
      (RetailDataService.uploadSingle as jest.Mock).mockRejectedValue(error);

      await RetailDataController.uploadSingle(
        req as Request,
        res as Response,
        next
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Upload failed",
      });
    });

    it("should handle other errors", async () => {
      const error = new Error("Validation error");
      (RetailDataService.uploadSingle as jest.Mock).mockRejectedValue(error);

      await RetailDataController.uploadSingle(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("bulkUpload", () => {
    it("should upload bulk data successfully", async () => {
      const mockInserted = [{ id: "1" }, { id: "2" }];
      req.file = { path: "/test/file.xlsx" } as any;
      (RetailDataService.bulkUpload as jest.Mock).mockResolvedValue(
        mockInserted
      );

      await RetailDataController.bulkUpload(
        req as Request,
        res as Response,
        next
      );

      expect(RetailDataService.bulkUpload).toHaveBeenCalledWith(
        "/test/file.xlsx",
        "test@example.com"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Data uploaded successfully, awaiting approval",
        count: 2,
      });
    });

    it("should handle missing file", async () => {
      req.file = undefined;

      await RetailDataController.bulkUpload(
        req as Request,
        res as Response,
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No file uploaded",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("File processing error");
      req.file = { path: "/test/file.xlsx" } as any;
      (RetailDataService.bulkUpload as jest.Mock).mockRejectedValue(error);

      await RetailDataController.bulkUpload(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("approve", () => {
    it("should approve record successfully", async () => {
      const mockRecord = { id: "1", status: "approved" };
      req.params = { id: "1" };
      (RetailDataService.approve as jest.Mock).mockResolvedValue(mockRecord);

      await RetailDataController.approve(req as Request, res as Response, next);

      expect(RetailDataService.approve).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Record approved",
        data: mockRecord,
      });
    });

    it("should handle record not found", async () => {
      req.params = { id: "1" };
      (RetailDataService.approve as jest.Mock).mockResolvedValue(null);

      await RetailDataController.approve(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Record not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      req.params = { id: "1" };
      (RetailDataService.approve as jest.Mock).mockRejectedValue(error);

      await RetailDataController.approve(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("reject", () => {
    it("should reject record successfully", async () => {
      const mockRecord = { id: "1", status: "rejected" };
      req.params = { id: "1" };
      req.body = { reason: "Invalid data" };
      (RetailDataService.reject as jest.Mock).mockResolvedValue(mockRecord);

      await RetailDataController.reject(req as Request, res as Response, next);

      expect(RetailDataService.reject).toHaveBeenCalledWith(
        "1",
        "Invalid data"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Record rejected",
        data: mockRecord,
      });
    });

    it("should handle record not found", async () => {
      req.params = { id: "1" };
      req.body = { reason: "Invalid data" };
      (RetailDataService.reject as jest.Mock).mockResolvedValue(null);

      await RetailDataController.reject(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Record not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      req.params = { id: "1" };
      req.body = { reason: "Invalid data" };
      (RetailDataService.reject as jest.Mock).mockRejectedValue(error);

      await RetailDataController.reject(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

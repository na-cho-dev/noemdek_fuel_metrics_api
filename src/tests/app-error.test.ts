import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/AppError";

describe("AppError", () => {
  it("should create a BadRequestError", () => {
    const error = new BadRequestError("Invalid input");

    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("BadRequestError");
    expect(error.isOperational).toBe(true);
  });

  it("should create an UnauthorizedError", () => {
    const error = new UnauthorizedError("Invalid credentials");

    expect(error.message).toBe("Invalid credentials");
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe("UnauthorizedError");
    expect(error.isOperational).toBe(true);
  });

  it("should create a ForbiddenError", () => {
    const error = new ForbiddenError("Access denied");

    expect(error.message).toBe("Access denied");
    expect(error.statusCode).toBe(403);
    expect(error.name).toBe("ForbiddenError");
    expect(error.isOperational).toBe(true);
  });

  it("should create a NotFoundError", () => {
    const error = new NotFoundError("Resource not found");

    expect(error.message).toBe("Resource not found");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("NotFoundError");
    expect(error.isOperational).toBe(true);
  });

  it("should create a ConflictError", () => {
    const error = new ConflictError("Resource already exists");

    expect(error.message).toBe("Resource already exists");
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe("ConflictError");
    expect(error.isOperational).toBe(true);
  });

  it("should create a ValidationError", () => {
    const error = new ValidationError("Validation failed");

    expect(error.message).toBe("Validation failed");
    expect(error.statusCode).toBe(422);
    expect(error.name).toBe("ValidationError");
    expect(error.isOperational).toBe(true);
  });

  //   it("should create an InternalServerError", () => {
  //     const error = InternalServerError("Internal server error");

  //     expect(error.message).toBe("Internal server error");
  //     expect(error.statusCode).toBe(500);
  //     expect(error.name).toBe("InternalServerError");
  //     expect(error.isOperational).toBe(true);
  //   });

  it("should create a generic AppError", () => {
    const error = new AppError("Error", 418);

    expect(error.message).toBe("Error");
    expect(error.statusCode).toBe(418);
    expect(error.name).toBe("Error");
    expect(error.isOperational).toBe(true);
  });

  it("should default to 500 status code if not provided", () => {
    const error = new AppError("Default error");

    expect(error.message).toBe("Default error");
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe("Error");
    expect(error.isOperational).toBe(true);
  });
});

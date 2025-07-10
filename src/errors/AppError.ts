export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom Error Classes
 */
export class ValidationError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 422) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ForbiddenError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string = "Forbidden access") {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string = "Bad request") {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConflictError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string = "Resource conflict") {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ServiceUnavailableError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string = "Service temporarily unavailable") {
    super(message);
    this.name = "ServiceUnavailableError";
    this.statusCode = 503;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

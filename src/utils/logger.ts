import winston from "winston";
import { config } from "../config";

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Add colors to winston
winston.addColors(colors);

// Create logger configuration
const createLogger = () => {
  const isDevelopment = config.NODE_ENV === "development";

  const transports: winston.transport[] = [
    // Console transport for development
    new winston.transports.Console({
      format: isDevelopment
        ? combine(
            colorize({ all: true }),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            errors({ stack: true }),
            simple()
          )
        : combine(timestamp(), errors({ stack: true }), json()),
    }),
  ];

  // Add file transports for production
  if (!isDevelopment) {
    transports.push(
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        format: combine(timestamp(), errors({ stack: true }), json()),
      }),
      new winston.transports.File({
        filename: "logs/combined.log",
        format: combine(timestamp(), errors({ stack: true }), json()),
      })
    );
  }

  return winston.createLogger({
    level: isDevelopment ? "debug" : "info",
    levels,
    format: combine(timestamp(), errors({ stack: true })),
    transports,
    exitOnError: false,
  });
};

export const logger = createLogger();

// Helper methods for structured logging
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, { error: error?.stack || error, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

export default logger;

import swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";
import { config } from "./index";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NOEMDEK Fuel Metrics API",
      version: "1.0.0",
      description: `
        A comprehensive REST API for analyzing and managing fuel price data across Nigerian states and regions. 
        This production-ready Express.js application provides real-time fuel price tracking, trend analysis, 
        and comprehensive reporting capabilities for petroleum products including PMS (Petrol), AGO (Diesel), 
        DPK (Kerosene), and LPG (Cooking Gas).
      `,
    },
    servers: [
      {
        url: `http://${config.HOST}:${config.PORT}`,
        description: "Development server",
      },
      {
        url: "https://noemdek-fuel-metrics-api.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
      schemas: {
        // User schemas
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User unique identifier",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            name: {
              type: "string",
              description: "User full name",
            },
            role: {
              type: "string",
              enum: ["admin", "analyst"],
              description: "User role",
            },
          },
        },

        // Auth schemas
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User password",
            },
          },
        },

        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              description: "User full name",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User password",
            },
          },
        },

        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            accessToken: {
              type: "string",
              description: "JWT access token",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
            },
            expiresIn: {
              type: "number",
              description: "Token expiration time in seconds",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },

        // Fuel Price schemas
        FuelPrice: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Unique record identifier",
            },
            state: {
              type: "string",
              description: "Nigerian state name",
            },
            region: {
              type: "string",
              enum: [
                "SOUTH_WEST",
                "SOUTH_EAST",
                "SOUTH_SOUTH",
                "NORTH_CENTRAL",
                "NORTH_EAST",
                "NORTH_WEST",
              ],
              description: "Geographical region",
            },
            period: {
              type: "string",
              format: "date",
              description: "Date period for the price data",
            },
            PMS: {
              type: "number",
              minimum: 0,
              description: "Premium Motor Spirit (Petrol) price in Naira",
            },
            AGO: {
              type: "number",
              minimum: 0,
              description: "Automotive Gas Oil (Diesel) price in Naira",
            },
            DPK: {
              type: "number",
              minimum: 0,
              description: "Dual Purpose Kerosene price in Naira",
            },
            LPG: {
              type: "number",
              minimum: 0,
              description:
                "Liquefied Petroleum Gas (Cooking Gas) price in Naira",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Record creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Record last update timestamp",
            },
          },
        },

        FuelPriceRequest: {
          type: "object",
          required: ["state", "region", "period", "PMS", "AGO", "DPK", "LPG"],
          properties: {
            state: {
              type: "string",
              minLength: 2,
              description: "Nigerian state name",
            },
            region: {
              type: "string",
              enum: [
                "SOUTH_WEST",
                "SOUTH_EAST",
                "SOUTH_SOUTH",
                "NORTH_CENTRAL",
                "NORTH_EAST",
                "NORTH_WEST",
              ],
              description: "Geographical region",
            },
            period: {
              type: "string",
              format: "date",
              description: "Date period for the price data (YYYY-MM-DD)",
            },
            PMS: {
              type: "number",
              minimum: 0,
              description: "Premium Motor Spirit (Petrol) price in Naira",
            },
            AGO: {
              type: "number",
              minimum: 0,
              description: "Automotive Gas Oil (Diesel) price in Naira",
            },
            DPK: {
              type: "number",
              minimum: 0,
              description: "Dual Purpose Kerosene price in Naira",
            },
            LPG: {
              type: "number",
              minimum: 0,
              description:
                "Liquefied Petroleum Gas (Cooking Gas) price in Naira",
            },
          },
        },

        // Response schemas
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              description: "Success message",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
            },
            code: {
              type: "string",
              description: "Error code",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Error timestamp",
            },
            path: {
              type: "string",
              description: "Request path",
            },
            method: {
              type: "string",
              description: "HTTP method",
            },
          },
        },

        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Validation failed",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: {
                    type: "string",
                    description: "Field that failed validation",
                  },
                  message: {
                    type: "string",
                    description: "Validation error message",
                  },
                },
              },
            },
            code: {
              type: "string",
              example: "VALIDATION_ERROR",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
            path: {
              type: "string",
            },
            method: {
              type: "string",
            },
          },
        },

        PaginationResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                records: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/FuelPrice",
                  },
                },
                page: {
                  type: "number",
                  description: "Current page number",
                },
                limit: {
                  type: "number",
                  description: "Records per page",
                },
                total: {
                  type: "number",
                  description: "Total number of records",
                },
                totalPages: {
                  type: "number",
                  description: "Total number of pages",
                },
              },
            },
          },
        },

        // Health check schemas
        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "OK",
            },
            environment: {
              type: "string",
              description: "Application environment",
            },
            uptime: {
              type: "number",
              description: "Server uptime in seconds",
            },
            memory: {
              type: "object",
              description: "Memory usage information",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
            version: {
              type: "string",
              example: "1.0.0",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);

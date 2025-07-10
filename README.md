# NOEMDEK Fuel Metrics API

A comprehensive REST API for analyzing and managing fuel price data across Nigerian states and regions. This production-ready Express.js application provides real-time fuel price tracking, trend analysis, and comprehensive reporting capabilities for petroleum products including PMS (Petrol), AGO (Diesel), DPK (Kerosene), and LPG (Cooking Gas).

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [API Documentation](#api-documentation)
- [Data Models](#data-models)
- [Analytics Features](#analytics-features)
- [Configuration](#configuration)
- [Data Import](#data-import)
- [Authentication](#authentication)
- [Testing](#testing)
- [Postman Collection](#postman-collection)
- [Error Handling](#error-handling)
- [Scripts](#scripts)
- [Contributing](#contributing)

---

## Overview

The NOEMDEK Fuel Metrics API is designed to provide comprehensive fuel price analytics for the Nigerian market. It tracks prices across all six geopolitical regions and provides insights into price trends, regional variations, and market dynamics for four major petroleum products.

### Supported Fuel Products
- **PMS** - Premium Motor Spirit (Petrol)
- **AGO** - Automotive Gas Oil (Diesel)
- **DPK** - Dual Purpose Kerosene
- **LPG** - Liquefied Petroleum Gas (Cooking Gas)

### Geographical Coverage
- **North East** - Adamawa, Bauchi, Borno, Gombe, Taraba, Yobe
- **North West** - Jigawa, Kaduna, Kano, Katsina, Kebbi, Sokoto, Zamfara
- **North Central** - Benue, FCT, Kogi, Kwara, Nasarawa, Niger, Plateau
- **South East** - Abia, Anambra, Ebonyi, Enugu, Imo
- **South West** - Ekiti, Lagos, Ogun, Ondo, Osun, Oyo
- **South South** - Akwa Ibom, Bayelsa, Cross River, Delta, Edo, Rivers

---

## Features

### 🚀 Core Functionality
- **Comprehensive CRUD Operations** for fuel price records
- **Real-time Price Tracking** across states and regions
- **Historical Data Management** with time-series analysis
- **Advanced Search & Filtering** capabilities
- **Pagination Support** for large datasets

### 📊 Analytics & Reporting
- **Price Change Analysis** with percentage calculations
- **Trend Analysis** with customizable time ranges (7d, 30d, 90d, 1y)
- **Regional Comparisons** and averages
- **Top/Bottom State Rankings** by product prices
- **Weekly Reports** with trend indicators
- **Mini Trends** for dashboard widgets
- **National Averages** across all time periods

### 🔐 Security & Performance
- **JWT Authentication** with Access & Refresh Token system
- **Role-based Access Control** with Admin and Analyst roles
- **Token Rotation** for enhanced security
- **Request Validation** with Zod schemas
- **Comprehensive Error Handling** with detailed error responses
- **Performance Optimization** with MongoDB aggregation pipelines
- **Input Sanitization** and validation middleware

### 🛠️ Technical Features
- **TypeScript** for comprehensive type safety
- **MongoDB** with Mongoose ODM and optimized queries
- **Excel Data Import** capabilities with bulk processing
- **Comprehensive Logging** with Winston
- **Health Check Endpoints** with dependency monitoring
- **CORS & Security Headers** with Helmet
- **Swagger Documentation** with auto-generated API specs
- **Redis Support** for caching and session management
- **File Upload** capabilities with Multer middleware

---

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 5.x
- **Language**: TypeScript with strict type checking
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) with refresh token rotation
- **Validation**: Zod for runtime type validation
- **Documentation**: Swagger/OpenAPI 3.0 with swagger-jsdoc
- **Logging**: Winston with structured logging
- **Security**: Helmet, CORS, bcryptjs for password hashing
- **File Processing**: XLSX for Excel imports, Multer for file uploads
- **Testing**: Jest with Supertest for API testing
- **Development**: ts-node-dev for hot reload, ESLint + Prettier for code quality
- **Caching**: Redis support for session management

---

## Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** (local instance or MongoDB Atlas)
- **pnpm** (recommended) or npm/yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd noemdek_technical_interview
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3300
   HOST=0.0.0.0
   MONGODB_URI=mongodb://localhost:27017/fuel_metrics_db
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=*
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Import sample data (optional):**
   ```bash
   pnpm run seed:db
   ```

The API will be available at `http://localhost:3300`

---

## Project Structure

```
src/
├── app.ts                          # Main application entry point
├── config/
│   ├── index.ts                    # Environment configuration
│   ├── database.ts                 # MongoDB connection setup
│   ├── roles.ts                    # Role-based access control definitions
│   └── swagger.ts                  # Swagger/OpenAPI configuration
├── controllers/
│   ├── auth.controller.ts          # Authentication endpoints
│   ├── fuel.price.controller.ts    # CRUD operations for fuel prices
│   ├── fuel.analysis.controller.ts # Analytics and reporting endpoints
│   └── retail-data.controller.ts   # Retail data management
├── middleware/
│   ├── auth.middleware.ts          # JWT authentication & authorization
│   ├── error.middleware.ts         # Global error handling
│   ├── upload.middleware.ts        # File upload handling
│   └── index.ts                    # Middleware exports
├── models/
│   ├── fuel.model.ts              # MongoDB schema for fuel data
│   ├── user.model.ts              # User schema with authentication
│   ├── refresh-token.model.ts     # Refresh token management
│   └── retail-entry.model.ts      # Retail data schema
├── routes/
│   ├── auth.routes.ts             # Authentication routes
│   ├── fuel.price.routes.ts       # Fuel price CRUD routes
│   ├── fuel.analysis.routes.ts    # Analytics routes
│   ├── retail-data.routes.ts      # Retail data routes
│   ├── system.routes.ts           # Health checks and system info
│   └── index.ts                   # Route exports
├── services/
│   ├── auth.service.ts            # Authentication business logic
│   ├── fuel.price.service.ts      # Business logic for price operations
│   ├── fuel.analysis.service.ts   # Analytics and reporting logic
│   ├── user.service.ts            # User management logic
│   ├── refresh-token.service.ts   # Token management
│   └── retail-data.service.ts     # Retail data business logic
├── types/
│   ├── auth.types.ts              # Authentication type definitions
│   ├── enums.ts                   # Enums for regions and fuel products
│   ├── fuel.types.ts             # TypeScript interfaces and DTOs
│   ├── retail-data.types.ts      # Retail data type definitions
│   ├── user.types.ts             # User-related types
│   └── express.d.ts              # Express request extension types
├── utils/
│   ├── logger.ts                  # Winston logging configuration
│   ├── jwt.ts                     # JWT utility functions
│   └── date-range.ts             # Date utility functions
├── validation/
│   ├── auth.schema.ts             # Authentication validation schemas
│   └── fuel.schema.ts             # Zod validation schemas
└── tests/
    ├── setup.ts                   # Test configuration
    ├── test-app.ts               # Test application factory
    ├── app.test.ts               # Application tests
    ├── auth.routes.test.ts       # Authentication endpoint tests
    ├── fuel.price.routes.test.ts # Fuel price endpoint tests
    ├── fuel.analysis.routes.test.ts # Analytics endpoint tests
    ├── middleware/
    │   └── auth.middleware.test.ts # Middleware tests
    └── utils/
        └── test-helpers.ts        # Test utility functions

scripts/
├── import-fuel-data.ts            # Excel data import script
└── reset-database.ts             # Database reset utility
```

---

## API Endpoints

### 🏥 Health & System
```
GET  /                    # API status and information
GET  /health              # Basic health check
GET  /health/detailed     # Detailed health with dependencies
GET  /api/info           # API metadata and available endpoints
GET  /api-docs           # Swagger documentation UI
```

### 🔐 Authentication
```
POST /api/auth/register   # User registration
POST /api/auth/login      # User authentication
POST /api/auth/refresh    # Token refresh
POST /api/auth/logout     # Logout and token revocation
GET  /api/auth/me         # Get current user information
```

### ⛽ Fuel Price Management
```
POST   /api/fuel          # Create new fuel price record
GET    /api/fuel          # Get all fuel prices (paginated & filtered)
GET    /api/fuel/filters  # Get available filter options
GET    /api/fuel/:id      # Get specific fuel price record
PUT    /api/fuel/:id      # Update fuel price record
DELETE /api/fuel/:id      # Delete fuel price record
```

#### Query Parameters for GET /api/fuel:
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10)
- `search` - Search by state or region name
- `sortBy` - Sort field (period, PMS, AGO, DPK, LPG)
- `order` - Sort direction (asc, desc)
- `product` - Filter by specific product
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter

### 🏪 Retail Data Management
```
POST   /api/retail-data          # Upload single retail data entry
POST   /api/retail-data/bulk     # Bulk upload via file
GET    /api/retail-data          # Get all retail data (filtered)
PUT    /api/retail-data/:id/approve  # Approve retail data entry
PUT    /api/retail-data/:id/reject   # Reject retail data entry
```

### 📊 Analytics & Reporting
```
GET /api/fuel-analysis/summary                    # Price summary with changes
GET /api/fuel-analysis/average/all-time          # National averages
GET /api/fuel-analysis/average-by-region         # Regional averages
GET /api/fuel-analysis/top/:product              # Top states by product
GET /api/fuel-analysis/trends                    # Price trends analysis
GET /api/fuel-analysis/mini-trend                # Mini trend for widgets
GET /api/fuel-analysis/price-change              # Price change analysis
GET /api/fuel-analysis/weekly-report             # Weekly state reports
```

#### Analytics Query Parameters:
- `product` - Fuel product (PMS, AGO, DPK, LPG)
- `state` - Specific state filter
- `region` - Regional filter
- `range` - Time range (7d, 30d, 90d, 1y)
- `order` - Sort order for rankings (asc, desc)

---

## API Documentation

### Swagger/OpenAPI Documentation
The API includes comprehensive Swagger documentation available at `/api-docs` when the server is running. 

#### Features:
- **Interactive API Explorer**: Test endpoints directly from the browser
- **Schema Definitions**: Complete request/response schemas
- **Authentication Support**: Built-in authentication testing
- **Example Requests**: Sample data for all endpoints
- **Response Examples**: Expected response formats

#### Accessing Documentation:
- **Local Development**: [http://localhost:3300/api-docs](http://localhost:3300/api-docs)
- **Production**: Available at your production domain `/api-docs`

#### Configuration:
The Swagger specification is configured in `src/config/swagger.ts` with:
- OpenAPI 3.0 specification
- JWT Bearer authentication
- Comprehensive schema definitions
- Multiple server environments
- Custom UI styling

---

## Data Models

### Fuel Price Record
```typescript
{
  _id: string;             // MongoDB ObjectId
  state: string;           // Nigerian state name
  region: Region;          // Geopolitical region enum
  period: Date;            // Price effective date
  AGO: number;            // Diesel price
  PMS: number;            // Petrol price
  DPK: number;            // Kerosene price
  LPG: number;            // Cooking gas price
  createdAt: Date;        // Record creation timestamp
  updatedAt: Date;        // Last update timestamp
}
```

### User Record
```typescript
{
  _id: string;             // MongoDB ObjectId
  name: string;            // User full name
  email: string;           // User email (unique)
  password: string;        // Hashed password
  role: "admin" | "analyst"; // User role
  isVerified: boolean;     // Email verification status
  createdAt: Date;        // Account creation timestamp
  updatedAt: Date;        // Last update timestamp
}
```

### Retail Data Entry
```typescript
{
  _id: string;             // MongoDB ObjectId
  retailerName: string;    // Name of the retailer
  location: string;        // Retailer location
  fuelType: "PMS" | "AGO" | "DPK" | "LPG"; // Fuel product type
  price: number;           // Price per liter/kg
  date: Date;             // Date of price recording
  status: "pending" | "approved" | "rejected"; // Approval status
  createdAt: Date;        // Record creation timestamp
  updatedAt: Date;        // Last update timestamp
}
```

### Response Formats
All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "page": 1,           // For paginated responses
  "total": 100,        // For paginated responses
  "totalPages": 10     // For paginated responses
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Analytics Features

### 📈 Price Trend Analysis
- Historical price movements over custom time periods
- Percentage change calculations
- Trend direction indicators (up, down, no-change)
- State and regional comparisons

### 🏆 Ranking Systems
- Top/bottom states by average prices
- Regional price comparisons
- Product-specific rankings
- Customizable sorting (highest/lowest prices)

### 📊 Statistical Analysis
- National average calculations
- Regional average breakdowns
- Price change analytics with historical comparisons
- Weekly reporting with trend indicators

### 🎯 Mini Analytics
- Compact trend data for dashboard widgets
- 7-day price snapshots
- Quick price change indicators
- State-specific mini reports

---

## Configuration

The application uses environment-based configuration:

### Required Environment Variables
```env
NODE_ENV=development|production
PORT=3300
HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017/fuel_metrics_db
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
CLIENT_URL=http://localhost:3000
```

### Optional Configuration
- **LOG_LEVEL**: Logging verbosity (error, warn, info, debug)
- **REQUEST_TIMEOUT**: API request timeout in milliseconds
- **MAX_FILE_SIZE**: Maximum upload file size for data import
- **RATE_LIMIT_WINDOW**: Rate limiting window in milliseconds (default: 15 minutes)
- **RATE_LIMIT_MAX**: Maximum requests per window (default: 100)

---

## Data Import

### Excel File Import
The API supports importing fuel price data from Excel files:

```bash
# Place your Excel file as 'fuel_data.xlsx' in the root directory
pnpm run seed:db
```

### Expected Excel Format
| State | Region | Period | AGO | PMS | DPK | LPG |
|-------|--------|--------|-----|-----|-----|-----|
| Lagos | South West | 2024-01-01 | 950.00 | 650.00 | 450.00 | 1200.00 |

### Database Reset
```bash
pnpm run reset:db  # Clears all fuel price data
```

---

## Authentication

### JWT Authentication
All API endpoints (except health checks and authentication endpoints) require authentication:

```bash
# Include JWT token in Authorization header
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow
1. **Register/Login**: User authenticates and receives a pair of tokens (access + refresh)
2. **API Access**: Access token is used for API requests until it expires
3. **Token Refresh**: When access token expires, refresh token is used to obtain new tokens
4. **Logout**: Refresh token is revoked on logout

### Token Management
- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register`
- **Refresh**: `POST /api/auth/refresh`
- **Logout**: `POST /api/auth/logout`
- **Current User**: `GET /api/auth/me`
- **Access Token Expiry**: 24 hours (configurable)
- **Refresh Token Expiry**: 7 days (configurable)

### Security Features
- **Token Rotation**: New refresh tokens are issued with every refresh
- **Revocation**: Refresh tokens are invalidated after use or logout
- **MongoDB Storage**: Refresh tokens are stored securely with TTL
- **Role-Based Access**: Different endpoints require specific user roles (Admin/Analyst)
- **Password Security**: bcryptjs hashing with salt rounds
- **Input Validation**: Comprehensive validation with Zod schemas

---

## Testing

The API comes with a comprehensive test suite built using Jest and Supertest. The tests cover all endpoints, authentication flows, and business logic.

### Test Structure

Tests are organized into several categories:
- **Unit Tests**: Test individual functions and services
- **Integration Tests**: Test API routes and endpoints
- **Authentication Tests**: Verify the security mechanisms
- **Middleware Tests**: Test custom middleware functions

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run only unit tests
pnpm test:unit

# Run only integration tests (routes tests)
pnpm test:integration
```

### Test Environment

Tests use an in-memory MongoDB server via `mongodb-memory-server` to provide isolation between test runs. This ensures tests don't interfere with your development or production databases.

### Test Coverage

The API includes comprehensive test coverage for:
- **Authentication flows** (registration, login, token refresh, logout)
- **All API endpoints** with success and error scenarios
- **Middleware functionality** (authentication, error handling)
- **Input validation** with various edge cases
- **Business logic** in services and controllers

### Test Best Practices

To ensure consistent and reliable test execution:

1. **Unique Test Data**: Tests use unique identifiers with timestamps and random strings to prevent conflicts between test runs
2. **Test Isolation**: Each test runs with its own data to prevent interference
3. **Data Cleanup**: The test environment cleans up data after all tests complete
4. **TypeScript Integration**: Jest globals are automatically recognized through tsconfig.json

### Test Commands

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration/routes tests only

# Generate coverage report
pnpm test:coverage

# Run tests in watch mode (during development)
pnpm test:watch
```

---

## Postman Collection

A ready-to-use [Postman collection](./NOEMDEK_FUEL_METRICS_API_(v2.1).postman_collection.json) is included for easy API testing.

### How to Use

1. **Open Postman** (download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)).
2. **Import the collection**:
   - Click "Import" in Postman.
   - Select the file: `NOEMDEK_FUEL_METRICS_API_(v2.1).postman_collection.json` from the project root.
3. **Set the `baseUrl` variable**:
   - The collection uses a `baseUrl` variable (default: `https://noemdek-fuel-metrics-api.onrender.com`).
   - Change it to your local server if needed (e.g., `http://localhost:3300`).
4. **Authorize requests**:
   - The collection is pre-configured for Bearer token authentication.
   - Update the token in the collection variables if you need to use a different user/session.
5. **Run requests**:
   - Use the organized folders to test authentication, fuel price, analytics, and retail data endpoints.

---

## Error Handling

### Error Types
- **ValidationError**: Invalid request data with detailed field errors
- **AuthenticationError**: Missing or invalid tokens
- **AuthorizationError**: Insufficient permissions for the requested action
- **NotFoundError**: Resource not found
- **DuplicateError**: Duplicate data conflicts (e.g., email already exists)
- **TokenExpiredError**: JWT token has expired
- **JsonWebTokenError**: Invalid JWT token format

### Error Response Format
```json
{
  "success": false,
  "message": "Detailed error description",
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/fuel",
  "method": "POST",
  "details": {...}  // Additional error context (development only)
}
```

#### Validation Error Example
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email format"
    },
    {
      "path": "password",
      "message": "Password must be at least 6 characters"
    }
  ],
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/register",
  "method": "POST"
}
```

---

## Scripts

### Development
```bash
pnpm dev              # Start development server with hot reload
pnpm dev:debug        # Start with debugger attached
pnpm build            # Compile TypeScript to JavaScript
pnpm start            # Start compiled production server
```

### Data Management
```bash
pnpm run seed:db      # Import fuel data from Excel
pnpm run reset:db     # Reset database
```

### Code Quality
```bash
pnpm lint             # ESLint code analysis
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
```

### Validation
```bash
pnpm validate         # Run lint + format + tests
```

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and validation (`pnpm validate`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled with comprehensive interfaces
- **ESLint**: Extended configuration with TypeScript support
- **Prettier**: Consistent code formatting across the codebase
- **Conventional Commits**: Standardized commit messages
- **Zod Validation**: Runtime type validation for all API inputs
- **Error Handling**: Comprehensive error handling with custom error classes

### Testing Requirements
- Unit tests for all new features and services
- Integration tests for all API endpoints
- Authentication tests for secured endpoints
- Minimum 80% code coverage maintained
- All tests must pass before merging
- Test data must use unique identifiers to avoid conflicts

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For questions, issues, or feature requests:
- **Issues**: [GitHub Issues](https://github.com/noemdek/fuel-metrics-api/issues)
- **Documentation**: [API Documentation](http://localhost:3300/api-docs)
- **Health Check**: [http://localhost:3300/health](http://localhost:3300/health)

---

**Built with ❤️ for the NOEMDEK Technical Interview**

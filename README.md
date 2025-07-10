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
- [Data Models](#data-models)
- [Analytics Features](#analytics-features)
- [Configuration](#configuration)
- [Data Import](#data-import)
- [Authentication](#authentication)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [Postman Collection](#postman-collection) <!-- Added new section -->

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
- **JWT Authentication** for secure API access
- **Role-based Access Control**
- **Request Validation** with Zod schemas
- **Error Handling** with detailed error responses
- **Performance Optimization** with MongoDB aggregation pipelines

### 🛠️ Technical Features
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **Excel Data Import** capabilities
- **Comprehensive Logging** with Winston
- **Health Check Endpoints**
- **CORS & Security Headers**

---

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS
- **Data Import**: XLSX for Excel file processing
- **Development**: ts-node-dev for hot reload

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
   PORT=5000
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

The API will be available at `http://localhost:5000`

---

## Project Structure

```
src/
├── app.ts                          # Main application entry point
├── config/
│   ├── index.ts                    # Environment configuration
│   └── database.ts                 # MongoDB connection setup
├── controllers/
│   ├── fuel.price.controller.ts    # CRUD operations for fuel prices
│   └── fuel.analysis.controller.ts # Analytics and reporting endpoints
├── middleware/
│   ├── auth.middleware.ts          # JWT authentication
│   └── error.middleware.ts         # Global error handling
├── models/
│   └── fuel.model.ts              # MongoDB schema for fuel data
├── routes/
│   ├── auth.routes.ts             # Authentication routes
│   ├── fuel.price.routes.ts       # Fuel price CRUD routes
│   └── fuel.analysis.routes.ts    # Analytics routes
├── services/
│   ├── fuel.price.service.ts      # Business logic for price operations
│   └── fuel.analysis.service.ts   # Analytics and reporting logic
├── types/
│   ├── enums.ts                   # Enums for regions and fuel products
│   └── fuel.types.ts             # TypeScript interfaces and DTOs
├── utils/
│   ├── logger.ts                  # Winston logging configuration
│   └── dateRange.ts              # Date utility functions
└── validation/
    └── fuel.schema.ts             # Zod validation schemas

scripts/
├── importFuelData.ts              # Excel data import script
└── resetDatabase.ts               # Database reset utility
```

---

## API Endpoints

### 🏥 Health & System
```
GET  /                    # API status and information
GET  /health              # Basic health check
GET  /health/detailed     # Detailed health with dependencies
GET  /api-info           # API metadata and available endpoints
```

### 🔐 Authentication
```
POST /api/auth/login      # User authentication
POST /api/auth/register   # User registration
POST /api/auth/refresh    # Token refresh
```

### ⛽ Fuel Price Management
```
POST   /api/fuel          # Create new fuel price record
GET    /api/fuel          # Get all fuel prices (paginated & filtered)
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

## Data Models

### Fuel Price Record
```typescript
{
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
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017/fuel_metrics_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
CLIENT_URL=http://localhost:3000
```

### Optional Configuration
- **LOG_LEVEL**: Logging verbosity (error, warn, info, debug)
- **REQUEST_TIMEOUT**: API request timeout in milliseconds
- **MAX_FILE_SIZE**: Maximum upload file size for data import

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
All API endpoints (except health checks) require authentication:

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
- **Access Token Expiry**: 24 hours
- **Refresh Token Expiry**: 7 days

### Security Features
- **Token Rotation**: New refresh tokens are issued with every refresh
- **Revocation**: Refresh tokens are invalidated after use or logout
- **MongoDB Storage**: Refresh tokens are stored with a unique constraint
- **Role-Based Access**: Different endpoints require specific user roles

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

### Test Best Practices

To ensure consistent and reliable test execution:

1. **Unique Test Data**: Always use unique identifiers (emails, usernames, etc.) for test data to prevent conflicts between test runs. The auth tests use a combination of timestamps and random strings to create unique emails:
   ```typescript
   const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
   const userData = {
     email: `user-${uniqueId}@example.com`,
     // other fields...
   };
   ```

2. **Test Isolation**: Each test runs with its own data to prevent interference between tests.

3. **Data Cleanup**: The test environment cleans up data after all tests complete.

4. **TypeScript Integration**: The project is configured to recognize Jest globals automatically through tsconfig.json, eliminating the need for explicit imports.

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:integration

# Generate coverage report
pnpm test:coverage

# Run tests in watch mode
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
   - Change it to your local server if needed (e.g., `http://localhost:5000`).
4. **Authorize requests**:
   - The collection is pre-configured for Bearer token authentication.
   - Update the token in the collection variables if you need to use a different user/session.
5. **Run requests**:
   - Use the organized folders to test authentication, fuel price, analytics, and retail data endpoints.

---

## Error Handling

### Error Types
- **ValidationError**: Invalid request data
- **AuthenticationError**: Missing or invalid tokens
- **AuthorizationError**: Insufficient permissions
- **NotFoundError**: Resource not found
- **DuplicateError**: Duplicate data conflicts

### Error Response Format
```json
{
  "success": false,
  "message": "Detailed error description",
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {...}  // Additional error context
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
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

### Testing Requirements
- Unit tests for new features
- Integration tests for API endpoints
- Minimum 80% code coverage
- All tests must pass before merging

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For questions, issues, or feature requests:
- **Issues**: [GitHub Issues](https://github.com/noemdek/fuel-metrics-api/issues)
- **Documentation**: [API Documentation](http://localhost:5000/api-docs)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

**Built with ❤️ for the NOEMDEK Technical Interview**

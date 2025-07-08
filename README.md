# NOEMDEK Technical Interview API

A robust, production-ready Express.js REST API template designed for technical interviews and rapid backend development. This project demonstrates best practices in error handling, authentication, configuration, and logging, with a focus on maintainability and scalability.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Authentication & Authorization](#authentication--authorization)
- [Logging](#logging)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **Express 5.x** with TypeScript
- **JWT Authentication** and role-based authorization
- **Centralized error handling** with custom error classes
- **Environment-based configuration** (dotenv)
- **MongoDB** integration via Mongoose
- **Winston logging** (console and file)
- **Security**: Helmet, CORS, rate limiting
- **Production-ready**: Graceful shutdown, process error handling
- **Extensible**: Modular structure for routes, middleware, and utilities

## Tech Stack
- Node.js, Express.js, TypeScript
- MongoDB (Mongoose)
- Winston (logging)
- JSON Web Token (JWT)
- Helmet, CORS, Compression

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (or npm/yarn)
- MongoDB instance (local or remote)

### Installation
```bash
pnpm install
# or
yarn install
# or
npm install
```

### Environment Variables
Create a `.env` file in the root directory. Example:
```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017/event_service_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
CORS_ORIGIN=*
CLIENT_URL=http://localhost:3000
```

### Running the App
- **Development:**
  ```bash
  pnpm dev
  # or
  npm run dev
  ```
- **Production:**
  ```bash
  pnpm build && pnpm start:prod
  # or
  npm run build && npm run start:prod
  ```

### Linting & Formatting
```bash
pnpm lint
pnpm format
```

### Testing
```bash
pnpm test
```

---

## Project Structure
```
├── src/
│   ├── app.ts                # Main Express app entrypoint
│   ├── config/               # Configuration and database connection
│   ├── errors/               # Custom error classes
│   ├── middleware/           # Auth, error, and other middleware
│   ├── routes/               # API route definitions
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions (logger, etc.)
├── logs/                     # Log files (created in production)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Configuration
All configuration is managed via environment variables and loaded in `src/config/index.ts`. See the [Environment Variables](#environment-variables) section for details.

---

## Scripts
- `dev` - Start development server with hot reload
- `build` - Compile TypeScript to JavaScript
- `start` - Start compiled app
- `start:prod` - Start in production mode
- `lint` - Lint code with ESLint
- `format` - Format code with Prettier
- `test` - Run tests with Jest

---

## API Endpoints

### Health & Info
- `GET /` - Root, API status
- `GET /health` - Basic health check
- `GET /health/detailed` - Health check with dependencies
- `GET /api/info` - API metadata

### Error Handling
- All errors are returned in a consistent JSON format with status, message, code, and timestamp.
- Custom error classes for validation, authentication, authorization, and more.

### Authentication & Authorization
- JWT-based authentication via `Authorization: Bearer <token>` header
- Role-based and permission-based access control
- Middleware for required and optional authentication

---

## Error Handling
- Centralized in `src/middleware/error.middleware.ts`
- Handles:
  - Custom operational errors (`AppError` and subclasses)
  - JWT errors (invalid/expired tokens)
  - Validation errors
  - MongoDB duplicate key errors
  - Unknown/internal errors (with stack trace in development)

---

## Authentication & Authorization
- Implemented in `src/middleware/auth.middleware.ts`
- JWT verification and user context injection
- Role and permission checks
- Optional authentication for public routes

---

## Logging
- Winston logger configured in `src/utils/logger.ts`
- Console logging in development, file logging in production (`logs/` directory)
- Structured logs for errors, requests, and system events

---

## Testing
- Jest is set up for unit and integration tests
- Run all tests: `pnpm test`
- Coverage: `pnpm test:coverage`

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE)

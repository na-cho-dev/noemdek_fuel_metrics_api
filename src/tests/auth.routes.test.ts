/**
 * @fileoverview Authentication Routes Tests
 * @description Comprehensive tests for user registration, login, token management, and validation
 * @testFile auth.routes.test.ts
 */
import request from "supertest";
import { createTestApp } from "./test-app";

const app = createTestApp();

// Helper function to generate truly unique IDs
const generateUniqueId = () => {
  // Add process ID and additional entropy to ensure uniqueness across parallel test runs
  return `${Date.now()}-${process.pid}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-${performance.now().toString().replace(".", "")}`;
};

describe("Authentication API Routes", () => {
  describe("User Registration (POST /api/auth/register)", () => {
    describe("✅ Success Cases", () => {
      it("should successfully register a new user with valid data and return authentication tokens", async () => {
        const uniqueId = `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const userData = {
          email: `newuser-${uniqueId}@example.com`,
          password: "password123!",
          name: "New User",
        };

        const res = await request(app)
          .post("/api/auth/register")
          .send(userData);

        // Verify response structure and status
        expect(res.status).toBe(201);
        expect(res.body).toEqual({
          success: true,
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(Number),
          user: {
            id: expect.any(String),
            email: userData.email,
            name: userData.name,
            role: expect.any(String),
          },
        });

        // Verify token formats (JWT structure)
        expect(res.body.accessToken).toMatch(
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
        );
        expect(res.body.refreshToken).toMatch(
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
        );

        // Verify expiration time is reasonable (24 hours = 86400 seconds)
        expect(res.body.expiresIn).toBe(86400);
      });
    });

    it('should assign default "analyst" role to new users during registration process', async () => {
      const uniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const userData = {
        email: `analyst-${uniqueId}@example.com`,
        password: "securePass123!",
        name: "Default Role User",
      };

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe("analyst");
    });
  });

  describe("❌ Validation Error Cases", () => {
    it("should reject registration with invalid email format and return validation errors", async () => {
      // For validation failures, we don't need unique emails since they won't be stored
      const invalidData = {
        email: "invalid-email-format",
        password: "password123!",
        name: "Test User",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: "email",
            message: expect.stringContaining("Invalid email"),
          }),
        ]),
        code: "VALIDATION_ERROR",
        timestamp: expect.any(String),
        path: "/api/auth/register",
        method: "POST",
      });
    });

    it("should reject registration with password shorter than 6 characters and return validation error", async () => {
      const uniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const invalidData = {
        email: `test-${uniqueId}@example.com`,
        password: "123",
        name: "Test User",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: "password",
            message: expect.stringContaining("at least 6 characters"),
          }),
        ]),
        code: "VALIDATION_ERROR",
        timestamp: expect.any(String),
        path: "/api/auth/register",
        method: "POST",
      });
    });

    it("should reject password without required special character and number", async () => {
      const uniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const invalidData = {
        email: `test-${uniqueId}@example.com`,
        password: "passwordonly",
        name: "Test User",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: "password",
            message: expect.stringContaining("special character"),
          }),
        ]),
        code: "VALIDATION_ERROR",
        timestamp: expect.any(String),
        path: "/api/auth/register",
        method: "POST",
      });
    });

    it("should reject registration with missing required fields", async () => {
      const uniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const incompleteData = {
        email: `test-${uniqueId}@example.com`,
        // Missing password and name
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(incompleteData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "password",
            message: expect.any(String),
          }),
          expect.objectContaining({
            path: "name",
            message: expect.any(String),
          }),
        ])
      );
    });

    it("should reject registration with empty request body", async () => {
      const res = await request(app).post("/api/auth/register").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({ path: "name" }),
          expect.objectContaining({ path: "email" }),
          expect.objectContaining({ path: "password" }),
        ]),
        code: "VALIDATION_ERROR",
        timestamp: expect.any(String),
        path: "/api/auth/register",
        method: "POST",
      });
    });
  });

  describe("⚠️ Business Logic Error Cases", () => {
    it("should prevent duplicate email registration and return appropriate error", async () => {
      const uniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const userData = {
        email: `duplicate-${uniqueId}@example.com`,
        password: "password123!",
        name: "First User",
      };

      // Register first user
      const firstRes = await request(app)
        .post("/api/auth/register")
        .send(userData);
      expect(firstRes.status).toBe(201);

      // Attempt to register with same email
      const duplicateRes = await request(app)
        .post("/api/auth/register")
        .send({
          ...userData,
          name: "Second User",
        });

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body).toEqual({
        success: false,
        message: "Email already in use",
        code: "Error",
        timestamp: expect.any(String),
        path: "/api/auth/register",
        method: "POST",
      });
    });
  });
});

describe("User Login (POST /api/auth/login)", () => {
  describe("✅ Success Cases", () => {
    it("should successfully login with valid credentials and return authentication tokens", async () => {
      // Create unique user for this test with improved uniqueness
      const uniqueId = generateUniqueId();
      const testUserCredentials = {
        email: `logintest-${uniqueId}@example.com`,
        password: "password123!",
        name: "Login Test User",
      };

      // Register user first and ensure it's successful
      let registrationRes;
      try {
        registrationRes = await request(app)
          .post("/api/auth/register")
          .send(testUserCredentials);

        // If registration failed, log the error and provide more details
        if (registrationRes.status !== 201) {
          console.error(
            `Registration failed with status ${registrationRes.status}:`,
            registrationRes.body
          );
          console.error(
            `Attempted to register user with email: ${testUserCredentials.email}`
          );
          throw new Error(
            `Registration failed: ${JSON.stringify(registrationRes.body)}`
          );
        }

        expect(registrationRes.status).toBe(201);

        // Add a small delay to ensure registration is fully processed
        await new Promise((resolve) => setTimeout(resolve, 100));

        const loginData = {
          email: testUserCredentials.email,
          password: testUserCredentials.password,
        };

        const res = await request(app).post("/api/auth/login").send(loginData);

        // If login failed, provide detailed error information
        if (res.status !== 200) {
          console.error(`Login failed with status ${res.status}:`, res.body);
          console.error(`Attempted to login with email: ${loginData.email}`);
          console.error(`Registration response was:`, registrationRes.body);
        }

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          success: true,
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(Number),
          user: {
            id: expect.any(String),
            email: testUserCredentials.email,
            name: testUserCredentials.name,
            role: expect.any(String),
          },
        });

        // Verify token formats
        expect(res.body.accessToken).toMatch(
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
        );
        expect(res.body.refreshToken).toMatch(
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
        );
      } catch (error) {
        // Log the error and fail the test
        console.error("Error during login test:", error);
        throw error;
      }
    });
    it("should reject login with non-existent email", async () => {
      const uniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const invalidLogin = {
        email: `nonexistent-${uniqueId}@example.com`,
        password: "password123!",
      };

      const res = await request(app).post("/api/auth/login").send(invalidLogin);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid credentials",
        code: "Error",
        timestamp: expect.any(String),
        path: "/api/auth/login",
        method: "POST",
      });
    });

    it("should reject login with incorrect password", async () => {
      // Register a new user to get a valid email
      const uniqueId = generateUniqueId();
      const userData = {
        email: `wrongpass-${uniqueId}@example.com`,
        password: "correctPassword123!",
        name: "Wrong Password User",
      };

      // Register the user
      const regRes = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(regRes.status).toBe(201);

      const invalidLogin = {
        email: userData.email,
        password: "wrongpassword123!",
      };

      const res = await request(app).post("/api/auth/login").send(invalidLogin);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid credentials",
        code: "Error",
        timestamp: expect.any(String),
        path: "/api/auth/login",
        method: "POST",
      });
    });

    it("should reject login with invalid email format", async () => {
      const invalidLogin = {
        email: "invalid-email",
        password: "password123!",
      };

      const res = await request(app).post("/api/auth/login").send(invalidLogin);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should reject login with missing credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({ path: "email" }),
          expect.objectContaining({ path: "password" }),
        ]),
        code: "VALIDATION_ERROR",
        timestamp: expect.any(String),
        path: "/api/auth/login",
        method: "POST",
      });
    });
  });
});

describe("Token Management", () => {
  describe("Refresh Token (POST /api/auth/refresh)", () => {
    it("should successfully refresh tokens with valid refresh token and provide new authentication credentials", async () => {
      // First register a unique user to get initial tokens
      const uniqueTimestamp = Date.now();
      const userData = {
        email: `refresh-test-${uniqueTimestamp}@example.com`,
        password: "password123!",
        name: "Refresh Token Test User",
      };

      const registrationRes = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(registrationRes.status).toBe(201);
      expect(registrationRes.body.success).toBe(true);

      const { refreshToken: originalRefreshToken } = registrationRes.body;

      // Add a small delay to ensure token generation happens at different times
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use refresh token to get new tokens
      const refreshRes = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: originalRefreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body).toEqual({
        success: true,
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
        user: expect.objectContaining({
          id: expect.any(String),
          email: userData.email,
          name: userData.name,
          role: expect.any(String),
        }),
      });

      // Verify token formats are valid JWT
      expect(refreshRes.body.accessToken).toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
      );
      expect(refreshRes.body.refreshToken).toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
      );

      // New refresh token should be different from original (token rotation)
      expect(refreshRes.body.refreshToken).not.toBe(originalRefreshToken);

      // Verify expiration time is set correctly
      expect(refreshRes.body.expiresIn).toBe(86400); // 24 hours
    });

    it("should reject refresh request with missing refresh token", async () => {
      const res = await request(app).post("/api/auth/refresh").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Refresh token is required",
        code: "Error",
        timestamp: expect.any(String),
        path: "/api/auth/refresh",
        method: "POST",
      });
    });
  });

  describe("Logout (POST /api/auth/logout)", () => {
    it("should successfully logout and revoke refresh token", async () => {
      // Register and get tokens
      const userData = {
        email: `logout-${Date.now()}@example.com`,
        password: "password123!",
        name: "Logout User",
      };

      const loginRes = await request(app)
        .post("/api/auth/register")
        .send(userData);

      const { refreshToken } = loginRes.body;

      // Logout
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body).toEqual({
        success: true,
        message: "Logged out successfully",
      });

      // Try to use the refresh token after logout (should fail)
      const refreshRes = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(refreshRes.status).toBe(401);
      expect(refreshRes.body.success).toBe(false);
    });

    it("should reject logout request with missing refresh token", async () => {
      const res = await request(app).post("/api/auth/logout").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Refresh token is required",
        code: "Error",
        timestamp: expect.any(String),
        path: "/api/auth/logout",
        method: "POST",
      });
    });
  });
});

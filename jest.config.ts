module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/src"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/tests/**",
    "!src/config/**",
    "!src/app.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html", "json"],
  testTimeout: 60000,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1,
  // Add CI-specific configurations
  verbose: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 55,
      lines: 65,
      statements: 65,
    },
  },
  // Generate JUnit XML for CI reporting (only in CI)
  reporters: process.env.CI ? [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "coverage",
        outputName: "junit.xml",
      },
    ],
  ] : ["default"],
};
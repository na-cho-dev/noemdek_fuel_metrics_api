const config: any = {
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
  reporters: ["default"],
};

// Only add jest-junit reporter in CI environment
if (process.env.CI) {
  config.reporters.push([
    "jest-junit",
    {
      outputDirectory: "coverage",
      outputName: "junit.xml",
    },
  ]);
}

module.exports = config;

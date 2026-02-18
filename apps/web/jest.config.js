const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^jose$": "<rootDir>/src/__mocks__/jose.ts"
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],

  // IMPORTANT: allow ESM packages like "jose" to be transformed
  transformIgnorePatterns: ["/node_modules/(?!jose)/"],
};

module.exports = createJestConfig(customJestConfig);

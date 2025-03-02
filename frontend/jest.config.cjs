module.exports = {
  // Use ts-jest to handle TypeScript files
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Use ts-jest for TypeScript files
  },
  preset: 'ts-jest', // Use ts-jest preset for TypeScript support
  testEnvironment: 'jest-environment-jsdom', // Test environment (use jsdom for browser-like testing)
  // setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'], // Setup testing-library jest-dom extension
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react', // Ensure JSX is handled correctly in TypeScript
      },
    },
  },
};

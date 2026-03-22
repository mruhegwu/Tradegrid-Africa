/**
 * Global Jest setup – runs once before the entire test suite.
 * Extend this file to configure mocks, seed test data, etc.
 */

// Silence console.log in tests to keep output clean.
// Remove or adjust if you need console output during testing.
global.console.log = jest.fn();

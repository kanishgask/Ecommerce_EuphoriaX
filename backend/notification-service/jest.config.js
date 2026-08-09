module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['controllers/**/*.js', 'services/**/*.js', 'repositories/**/*.js'],
  coverageReporters: ['lcov', 'text'],
  coverageDirectory: 'coverage',
};

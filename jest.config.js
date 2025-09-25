module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'Controllers/**/*.js',
    'Models/**/*.js',
    'Services/**/*.js',
    'Middlewares/**/*.js',
    '!node_modules/**'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
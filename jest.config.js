/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 1,
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  coveragePathIgnorePatterns: [
    'src/index.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
};

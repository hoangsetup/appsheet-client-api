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
    'src/browser/index.ts',
    'src/browser/AppSheetApiClientBrowser.ts',
    'src/AppSheetApiClient.ts',
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

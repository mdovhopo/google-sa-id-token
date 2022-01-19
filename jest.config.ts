import type Jest from '@jest/types';

const config: Jest.Config.InitialOptions = {
  moduleFileExtensions: ['js', 'ts'],
  rootDir: '.',
  testRegex: 'test/.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: ['src/*.ts', 'src/**/*.ts'],
  coveragePathIgnorePatterns: ['test/.*$'],
  coverageDirectory: '.coverage',
  testEnvironment: 'node',
  testTimeout: 10000,
  setupFiles: ['./test/utils/set-test-timeout.ts'],
};

export default config;

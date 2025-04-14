import type {Config} from "@jest/types";

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {'\\.css$': 'identity-obj-proxy'},
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      { useESM: true }
    ]
  }
}

export default config;
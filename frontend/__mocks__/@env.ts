// __mocks__/@env.ts
export const USE_LOCAL = 'false';
export const LOCAL_IP = undefined;
export const BASE_URL = 'https://mock-api-url.com';

export default {
  USE_LOCAL,
  LOCAL_IP,
  BASE_URL
};

/**
 * This file provides a manual Jest mock for environment variables imported from '@env'.
 * It is used to simulate .env values during testing without relying on actual environment files.
 * 
 * Jest will automatically use this mock when any module imports variables from '@env'
 * thanks to moduleNameMapper configuration in jest.config.js (e.g., '^@env$': '<rootDir>/__mocks__/@env.ts')
 */
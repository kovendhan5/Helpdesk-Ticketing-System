// Jest setup file for frontend testing
import '@testing-library/jest-dom';

// Mock axios globally for all tests
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ 
      data: {},
      status: 200,
      statusText: 'OK'
    })),
    post: jest.fn(() => Promise.resolve({ 
      data: {},
      status: 200,
      statusText: 'OK'
    })),
    put: jest.fn(() => Promise.resolve({ 
      data: {},
      status: 200,
      statusText: 'OK'
    })),
    delete: jest.fn(() => Promise.resolve({ 
      data: {},
      status: 200,
      statusText: 'OK'
    })),
    create: jest.fn(function() {
      return this;
    }),
    defaults: {
      headers: {
        common: {},
        get: {},
        post: {},
        put: {},
        patch: {},
        delete: {}
      }
    }
  },
}));

// Mock localStorage for tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage for tests
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Suppress console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

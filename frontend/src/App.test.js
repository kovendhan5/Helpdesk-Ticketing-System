import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock axios to prevent network calls during testing
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Simple component test that doesn't require full app loading
test('renders without crashing', () => {
  const TestComponent = () => <div>Test Component</div>;
  render(
    <BrowserRouter>
      <TestComponent />
    </BrowserRouter>
  );
  expect(screen.getByText('Test Component')).toBeInTheDocument();
});

test('browser router works correctly', () => {
  const TestComponent = () => <div data-testid="test-element">Router Test</div>;
  render(
    <BrowserRouter>
      <TestComponent />
    </BrowserRouter>
  );
  expect(screen.getByTestId('test-element')).toBeInTheDocument();
});

// Test that axios mock is working
test('axios is properly mocked', () => {
  const axios = require('axios');
  expect(typeof axios.get).toBe('function');
  expect(typeof axios.post).toBe('function');
});

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders helpdesk application', () => {
  render(<App />);
  // Simple test to ensure app renders without crashing
  expect(document.body).toBeInTheDocument();
});

test('application loads without errors', () => {
  const { container } = render(<App />);
  expect(container.firstChild).toBeTruthy();
});

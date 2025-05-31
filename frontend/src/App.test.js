// Basic sanity tests for CI
test('basic math works', () => {
  expect(1 + 1).toBe(2);
});

test('environment setup works', () => {
  expect(process.env.NODE_ENV).toBeDefined();
});

test('jest is working', () => {
  expect(true).toBe(true);
});
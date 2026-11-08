import { it, expect } from 'vitest';

it('probe environment', () => {
  expect(typeof localStorage).toBe('object');
});

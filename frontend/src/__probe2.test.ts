
import { it, expect } from 'vitest';
it('probe globals', () => {
  expect(typeof document).toBe('object');
  expect(typeof window).toBe('object');
});

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Polyfills de ambiente jsdom usados por componentes Radix/Router
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'URL.createObjectURL', {
  writable: true,
  value: () => 'blob:mock-object-url',
});

Object.defineProperty(window, 'URL.revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

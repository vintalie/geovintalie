import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Polyfill de localStorage (ausente nesta instalacao do jsdom, o que
// quebra antesEach/afterEach de toda a suíte de testes).
const createLocalStorage = () => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => {
      return [...store.keys()][index] ?? null;
    },
  };
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: createLocalStorage(),
});

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: createLocalStorage(),
});

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

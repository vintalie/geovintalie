import type { RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { render as rtlRender } from '@testing-library/react';
import type { ReactNode } from 'react';

/**
 * Render envolvido em MemoryRouter + AuthProvider.
 * Limpe o localStorage em beforeEach de cada teste para isolar o AuthProvider.
 */
export function render(
  ui: ReactNode,
  options?: RenderOptions & { initialEntries?: string[] },
): RenderResult {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={options?.initialEntries ?? ['/']}>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
  return rtlRender(ui, { wrapper, ...options });
}

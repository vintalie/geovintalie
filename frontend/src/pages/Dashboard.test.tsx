import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import Dashboard from './Dashboard';
import { render } from '@/test/render';
import * as authApi from '@/api/auth';

vi.mock('@/api/auth', () => ({
  me: vi.fn(),
}));

const mockMe = vi.mocked(authApi.me);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('Dashboard', () => {
  it('renderiza boas-vindas com o nome do usuário autenticado', async () => {
    localStorage.setItem('token', 'token-teste');
    mockMe.mockResolvedValue({
      data: { user: { id: 1, name: 'Usuário Teste', email: 'user@test.com' } },
    } as any);
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByText(/Bem-vindo, Usuário Teste!/)).toBeInTheDocument(),
    );
  });

  it('não quebra quando não há usuário autenticado', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Bem-vindo,/)).toBeInTheDocument();
  });

  it('exibe instrução de uso do menu lateral', () => {
    render(<Dashboard />);
    expect(
      screen.getByText(/Use o menu lateral para gerenciar localidades/i),
    ).toBeInTheDocument();
  });
});

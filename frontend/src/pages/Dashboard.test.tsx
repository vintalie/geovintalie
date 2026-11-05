import { describe, it, expect, vi, beforeEach, waitFor } from 'vitest';
import { screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { render } from '@/test/render';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('Dashboard', () => {
  it('renderiza boas-vindas com o nome do usuário autenticado', async () => {
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

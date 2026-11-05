import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { SiteHeader } from './SiteHeader';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import * as authApi from '@/api/auth';
import { render } from '@/test/render';

vi.mock('@/hooks/useAuth');
vi.mock('react-router-dom', async (importOriginal: () => Promise<any>) => {
  const actual = (await importOriginal()) as typeof import('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});
vi.mock('@/api/auth', () => ({ me: vi.fn() }));

const mockUseAuth = vi.mocked(useAuth);
const mockNavigate = vi.mocked(useNavigate);
const mockMe = vi.mocked(authApi.me);
let navigateFn: ReturnType<typeof vi.fn>;

function autenticar(usuario: any) {
  localStorage.setItem('token', 'token-teste');
  mockMe.mockResolvedValue({ data: { user: usuario } } as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  navigateFn = vi.fn();
  mockNavigate.mockImplementation(() => navigateFn);
  mockUseAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() } as any);
});

afterEach(() => {
  localStorage.clear();
});

describe('SiteHeader', () => {
  it('sem sessão exibe a marca e o link Entrar, sem opções de sair', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('link', { name: /Geovintalie/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument();
  });

  it('usuário autenticado exibe Painel, Sair e não exibe Administração', async () => {
    autenticar({ id: 1, name: 'Usuário', email: 'u@test.com', role: 'user' });
    render(<SiteHeader />);
    await waitFor(() => expect(mockMe).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('Painel')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();
    expect(screen.queryByText(/Administração/)).not.toBeInTheDocument();
  });

  it('usuário admin exibe o link Administração', async () => {
    autenticar({ id: 2, name: 'Admin', email: 'admin@test.com', role: 'admin' });
    render(<SiteHeader />);
    await waitFor(() => expect(screen.getByText(/Administração/)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /entrar/i })).not.toBeInTheDocument();
  });

  it('clicar em Sair faz logout e navega para /login', async () => {
    autenticar({ id: 1, name: 'Usuário', email: 'u@test.com' });
    const user = userEvent.setup();
    render(<SiteHeader />);
    await waitFor(() => expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /sair/i }));
    expect(mockUseAuth.mock.results[0]?.value.logout).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(navigateFn).toHaveBeenCalledWith('/login', { replace: true }));
  });
});

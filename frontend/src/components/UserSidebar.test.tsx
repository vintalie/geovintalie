import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { UserSidebar } from './UserSidebar';
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

function autenticar(usuario: any, admin = false) {
  localStorage.setItem('token', 'token-teste');
  mockMe.mockResolvedValue(
    { data: { user: { ...usuario, role: admin ? 'admin' : 'user' } } } as any,
  );
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

describe('UserSidebar', () => {
  it('sem sessão exibe links do menu comum e o botão Sair', () => {
    render(<UserSidebar />);
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Minhas Propriedades/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mapa/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Importar\/Exportar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();
    expect(screen.getByText(/Usuário/i)).toBeInTheDocument();
  });

  it('não exibe links exclusivos de admin para usuário comum', async () => {
    autenticar({ id: 1, name: 'Usuário', email: 'u@test.com' }, false);
    render(<UserSidebar />);
    await waitFor(() => expect(mockMe).toHaveBeenCalled());
    expect(screen.queryByRole('link', { name: /Países/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Administração/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Usuários/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Usuário/i)).toBeInTheDocument();
  });

  it('exibe links de admin e badge Admin quando o usuário é admin', async () => {
    autenticar({ id: 2, name: 'Admin', email: 'admin@test.com' }, true);
    render(<UserSidebar />);
    await waitFor(() => expect(screen.getByText(/Admin/i)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Países/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Administração/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Usuários/i })).toBeInTheDocument();
  });

  it('alternar painel lateral muda a largura de 16rem para 3rem e vice-versa', () => {
    const { container } = render(<UserSidebar />);
    const aside = container.querySelector('aside')!;
    expect(aside.style.width).toBe('16rem');
    const toggle = screen.getByRole('button', { name: /alternar painel lateral/i });
    userEvent.setup().click(toggle).then(() => {
      expect(aside.style.width).toBe('3rem');
    });
  });

  it('clicar em Sair faz logout e navega para /login', async () => {
    autenticar({ id: 1, name: 'Usuário', email: 'u@test.com' });
    const user = userEvent.setup();
    render(<UserSidebar />);
    await waitFor(() => expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /sair/i }));
    expect(mockUseAuth.mock.results[0]?.value.logout).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(navigateFn).toHaveBeenCalledWith('/login'));
  });

  it('os links do menu apontam para as rotas corretas', () => {
    render(<UserSidebar />);
    expect(screen.getByRole('link', { name: /Minhas Propriedades/i })).toHaveAttribute(
      'href',
      '/properties',
    );
    expect(screen.getByRole('link', { name: /Meus Produtos/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /Mapa/i })).toHaveAttribute('href', '/map');
    expect(screen.getByRole('link', { name: /Importar\/Exportar/i })).toHaveAttribute(
      'href',
      '/import-export',
    );
  });
});

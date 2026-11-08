import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, fireEvent } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import Register from './Register';
import * as authApi from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import { render } from '@/test/render';

vi.mock('react-router-dom', async (importOriginal: () => Promise<any>) => {
  const actual = (await importOriginal()) as typeof import('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
  updateUser: vi.fn(),
}));

const mockRegister = vi.mocked(authApi.register);
const mockLogin = vi.mocked(authApi.login);
const mockMe = vi.mocked(authApi.me);
const mockNavigate = vi.mocked(useNavigate);
let navigateFn: any;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  navigateFn = vi.fn();
  mockNavigate.mockImplementation(() => navigateFn);
  mockRegister.mockResolvedValue({ data: {} } as any);
  mockLogin.mockResolvedValue({ data: { token: 'token-registro' } } as any);
  mockMe.mockResolvedValue(
    {
      data: { user: { id: 1, name: 'Novo', email: 'novo@test.com' } },
    } as any,
  );
});

afterEach(() => {
  localStorage.clear();
});

async function preencherCadastro(nome: string, email: string, senha: string) {
  const user = userEvent.setup();
  await user.clear(document.getElementById('name')!);
  await user.type(document.getElementById('name')!, nome);
  await user.clear(document.getElementById('email')!);
  await user.type(document.getElementById('email')!, email);
  await user.clear(document.getElementById('password')!);
  await user.type(document.getElementById('password')!, senha);
}

describe('Register', () => {
  it('renderiza o formulário de cadastro com nome, e-mail, senha e botão Registrar', () => {
    render(<Register />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('faz cadastro com sucesso, chama as APIs, define o token e redireciona', async () => {
    const user = userEvent.setup();
    render(<Register />);
    await preencherCadastro('Novo Usuario', 'novo@test.com', 'senha456');
    await user.click(screen.getByRole('button', { name: /registrar/i }));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith('Novo Usuario', 'novo@test.com', 'senha456'),
    );
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('novo@test.com', 'senha456'));
    await waitFor(() =>
      expect(navigateFn).toHaveBeenCalledWith('/', { replace: true }),
    );
    expect(localStorage.getItem('token')).toBe('token-registro');
  });

  it('desabilita o botão enquanto a requisição está em andamento', async () => {
    let resolveRegister!: (value: any) => void;
    mockRegister.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve;
        }),
    );
    render(<Register />);
    const botao = screen.getByRole('button', { name: /registrar/i });
    await preencherCadastro('Novo Usuario', 'novo@test.com', 'senha456');
    fireEvent.click(botao);
    expect(botao).toBeDisabled();
    resolveRegister({ data: {} });
    await waitFor(() => expect(botao).not.toBeDisabled());
  });

  it('exibe mensagem de erro quando o cadastro falha', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValue({
      response: { data: { message: 'E-mail já cadastrado' } },
    });
    render(<Register />);
    await preencherCadastro('Novo Usuario', 'novo@test.com', 'senha456');
    await user.click(screen.getByRole('button', { name: /registrar/i }));

    await waitFor(() =>
      expect(screen.getByText('E-mail já cadastrado')).toBeInTheDocument(),
    );
    expect(navigateFn).not.toHaveBeenCalled();
  });

  it('link de login navega para a página de login', async () => {
    render(<Register />);
    // O Link usa o react-router real (nao o useNavigate mocado), entao
    // assertamos o destino do link em vez de espionar a navegacao.
    expect(
      screen.getByRole('link', { name: /login/i }),
    ).toHaveAttribute('href', '/login');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import Login from './Login';
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

const mockLogin = vi.mocked(authApi.login);
const mockRegister = vi.mocked(authApi.register);
const mockMe = vi.mocked(authApi.me);
const mockNavigate = vi.mocked(useNavigate);

function getForm() {
  const form = document.querySelector('form');
  expect(form).toBeInTheDocument();
  return form as HTMLFormElement;
}

function preencherLogin(email: string, senha: string) {
  fireEvent.change(document.getElementById('email')!, { target: { value: email } });
  fireEvent.change(document.getElementById('password')!, { target: { value: senha } });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // useNavigate mockado retorna undefined por padrão; define um navegador falso
  mockNavigate.mockReturnValue(vi.fn());
  mockLogin.mockResolvedValue({ data: { token: 'token-teste-123' } });
  mockRegister.mockResolvedValue({ data: {} });
  mockMe.mockResolvedValue({
    data: { user: { id: 1, name: 'Usuário Teste', email: 'user@test.com' } },
  });
});

afterEach(() => {
  localStorage.clear();
});

describe('Login', () => {
  it('renderiza o formulário de login com e-mail, senha e botão Entrar', () => {
    render(<Login />);
    const form = getForm();
    expect(within(form).getByLabelText('E-mail')).toBeInTheDocument();
    expect(within(form).getByLabelText('Senha')).toBeInTheDocument();
    expect(
      within(form).getByRole('button', { name: /entrar/i }),
    ).toBeInTheDocument();
  });

  it('alternar para a aba de cadastro exibe o campo Nome', () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('tab', { name: /criar conta/i }));
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    const forms = document.querySelectorAll('form');
    expect(forms.length).toBe(2);
    expect(within(forms[1]).getByRole('button', { name: /registrar/i })).toBeInTheDocument();
  });

  it('faz login com sucesso, chama a API, define o token e redireciona', async () => {
    render(<Login />);
    const form = getForm();
    preencherLogin('user@test.com', 'senha123');

    fireEvent.submit(form);

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'senha123'));
    await waitFor(() => expect(mockMe).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    expect(localStorage.getItem('token')).toBe('token-teste-123');
  });

  it('desabilita o botão enquanto a requisição está em andamento', async () => {
    let resolveLogin!: (value: any) => void;
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );
    render(<Login />);
    const form = getForm();
    const botao = within(form).getByRole('button', { name: /entrar/i });
    preencherLogin('a@b.com', 'x');
    fireEvent.submit(form);
    expect(botao).toBeDisabled();
    resolveLogin({ data: { token: 'tok' } });
    await waitFor(() => expect(botao).not.toBeDisabled());
  });

  it('exibe mensagem de erro quando o login falha', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Credenciais inválidas' } },
    });
    render(<Login />);
    const form = getForm();
    preencherLogin('user@test.com', 'senha123');
    fireEvent.submit(form);
    await waitFor(() =>
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument(),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('fluxo de registro: cadastra e faz login automaticamente', async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('tab', { name: /criar conta/i }));
    fireEvent.change(document.getElementById('name')!, { target: { value: 'Novo' } });
    fireEvent.change(document.getElementById('regEmail')!, {
      target: { value: 'novo@test.com' },
    });
    fireEvent.change(document.getElementById('regPassword')!, {
      target: { value: 'senha456' },
    });
    const forms = document.querySelectorAll('form');
    fireEvent.submit(forms[1]);

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith('Novo', 'novo@test.com', 'senha456'),
    );
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('novo@test.com', 'senha456'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('redireciona para / quando já há token no localStorage', () => {
    localStorage.setItem('token', 'token-existente');
    render(<Login />);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

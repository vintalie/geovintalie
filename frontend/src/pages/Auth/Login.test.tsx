import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, fireEvent } from '@testing-library/react';
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
let navigateFn: any;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  navigateFn = vi.fn();
  mockNavigate.mockImplementation(() => navigateFn);
  mockLogin.mockResolvedValue({ data: { token: 'token-teste-123' } } as any);
  mockRegister.mockResolvedValue({ data: {} } as any);
  mockMe.mockResolvedValue(
    {
      data: { user: { id: 1, name: 'Usuário Teste', email: 'user@test.com' } },
    } as any,
  );
});

afterEach(() => {
  localStorage.clear();
});

async function preencherLogin(email: string, senha: string) {
  const user = userEvent.setup();
  await user.clear(screen.getByLabelText('E-mail'));
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.clear(screen.getByLabelText('Senha'));
  await user.type(screen.getByLabelText('Senha'), senha);
}

function getLoginForm() {
  const form = document.querySelector('form');
  expect(form).toBeInTheDocument();
  return form as HTMLFormElement;
}

describe('Login', () => {
  it('renderiza o formulário de login com e-mail, senha e botão Entrar', () => {
    render(<Login />);
    // eslint-disable-next-line no-console
    console.log('DEBUG FORMS:', document.querySelectorAll('form').length, 'BODY LEN:', document.body.innerHTML.length);
    const form = getLoginForm();
    expect(within(form).getByLabelText('E-mail')).toBeInTheDocument();
    expect(within(form).getByLabelText('Senha')).toBeInTheDocument();
    expect(
      within(form).getByRole('button', { name: /entrar/i }),
    ).toBeInTheDocument();
  });

  it('alternar para a aba de cadastro exibe o campo Nome', async () => {
    const user = userEvent.setup();
    render(<Login />);
    await user.click(screen.getByRole('tab', { name: /criar conta/i }));
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    const forms = document.querySelectorAll('form');
    expect(forms.length).toBe(2);
    expect(
      within(forms[1]).getByRole('button', { name: /registrar/i }),
    ).toBeInTheDocument();
  });

  it('faz login com sucesso, chama a API, define o token e redireciona', async () => {
    const user = userEvent.setup();
    render(<Login />);
    await preencherLogin('user@test.com', 'senha123');
    const form = getLoginForm();
    await user.click(within(form).getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'senha123'),
    );
    await waitFor(() => expect(mockMe).toHaveBeenCalled());
    await waitFor(() => expect(navigateFn).toHaveBeenCalledWith('/'));
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
    const user = userEvent.setup();
    render(<Login />);
    const form = getLoginForm();
    const botao = within(form).getByRole('button', { name: /entrar/i });
    await preencherLogin('a@b.com', 'x');
    fireEvent.submit(form);
    expect(botao).toBeDisabled();
    resolveLogin({ data: { token: 'tok' } });
    await waitFor(() => expect(botao).not.toBeDisabled());
  });

  it('exibe mensagem de erro quando o login falha', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Credenciais inválidas' } },
    } as any);
    render(<Login />);
    const form = getLoginForm();
    await preencherLogin('user@test.com', 'senha123');
    await user.click(within(form).getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument(),
    );
    expect(navigateFn).not.toHaveBeenCalled();
  });

  it('fluxo de registro: cadastra e faz login automaticamente', async () => {
    const user = userEvent.setup();
    render(<Login />);
    await user.click(screen.getByRole('tab', { name: /criar conta/i }));
    await user.clear(document.getElementById('name')!);
    await user.type(document.getElementById('name')!, 'Novo');
    await user.clear(document.getElementById('regEmail')!);
    await user.type(document.getElementById('regEmail')!, 'novo@test.com');
    await user.clear(document.getElementById('regPassword')!);
    await user.type(document.getElementById('regPassword')!, 'senha456');
    const forms = document.querySelectorAll('form');
    fireEvent.submit(forms[1]);

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith('Novo', 'novo@test.com', 'senha456'),
    );
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('novo@test.com', 'senha456'),
    );
    await waitFor(() => expect(navigateFn).toHaveBeenCalledWith('/'));
  });

  it('redireciona para / quando já há token no localStorage', () => {
    localStorage.setItem('token', 'token-existente');
    render(<Login />);
    expect(navigateFn).toHaveBeenCalledWith('/');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/react';
import Login from './Login';
import * as authApi from '@/api/auth';
import { render } from '@/test/render';

vi.mock('react-router-dom', async (importOriginal: () => Promise<any>) => {
  const actual = (await importOriginal()) as typeof import('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
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
const mockNavigate = vi.mocked(useNavigate);
let navigateFn: any;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  navigateFn = vi.fn();
  mockNavigate.mockImplementation(() => navigateFn);
  mockLogin.mockResolvedValue({ data: { token: 'token-teste-123' } } as any);
});

afterEach(() => {
  localStorage.clear();
});

function getLoginForm() {
  const form = document.querySelector('form');
  expect(form).toBeInTheDocument();
  return form as HTMLFormElement;
}

describe('Login', () => {
  it('renderiza o formulário de login', () => {
    render(<Login />);
    console.log('FORMS IN TEST:', document.querySelectorAll('form').length);
    const form = getLoginForm();
    expect(within(form).getByLabelText('E-mail')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
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
const mockNavigate = vi.mocked(useNavigate);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockLogin.mockResolvedValue({ data: { token: 'token-teste-123' } });
});

afterEach(() => {
  localStorage.clear();
});

describe('probe2', () => {
  it('renders form', () => {
    render(<Login />);
    // eslint-disable-next-line no-console
    console.log('FORMS:', screen.getAllByRole('form').length);
    const tp = document.getElementById('radix-_r_0_-content-login');
    // eslint-disable-next-line no-console
    console.log('TABPANEL HTML:', tp?.innerHTML);
    expect(screen.getAllByRole('form')[0]).toBeInTheDocument();
  });
});

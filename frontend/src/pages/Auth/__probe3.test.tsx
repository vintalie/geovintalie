import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
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

describe('probe3', () => {
  it('renders form', () => {
    mockLogin.mockResolvedValue({ data: { token: 'token-teste-123' } });
    render(<Login />);
    // eslint-disable-next-line no-console
    console.log('FORMS:', screen.getAllByRole('form').length);
    expect(screen.getAllByRole('form')[0]).toBeInTheDocument();
  });
});

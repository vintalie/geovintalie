import { test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Login from './Login';
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

test('probe8', () => {
  render(<Login />);
  expect(document.body).toBeInTheDocument();
  // eslint-disable-next-line no-console
  console.log('FORMS via screen:', screen.getAllByRole('form').length);
});

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

test('probe10', () => {
  const { container, getAllByRole: containerGetAllByRole } = render(<Login />);
  // eslint-disable-next-line no-console
  console.log('container.querySelector form:', container.querySelector('form') !== null);
  // eslint-disable-next-line no-console
  console.log('document.body.querySelector form:', document.body.querySelector('form') !== null);
  try {
    // eslint-disable-next-line no-console
    console.log('screen.getAllByRole form:', screen.getAllByRole('form').length);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log('screen.getAllByRole THREW:', e.message);
  }
  try {
    // eslint-disable-next-line no-console
    console.log('container-bound getAllByRole form:', containerGetAllByRole('form').length);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log('container-bound getAllByRole THREW:', e.message);
  }
  expect(true).toBe(true);
});

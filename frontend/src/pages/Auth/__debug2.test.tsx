import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { render } from '@/test/render';

vi.mock('react-router-dom', async (importOriginal: any) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: vi.fn() };
});
vi.mock('@/api/auth', () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn(), me: vi.fn(), refresh: vi.fn(), updateUser: vi.fn() }));

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });
afterEach(() => localStorage.clear());

it('debug doc', () => {
  console.log('userEvent type:', typeof userEvent.setup);
  render(<Login />);
  console.log('forms via document:', document.querySelectorAll('form').length);
  console.log('body HTML len:', document.body.innerHTML.length);
  expect(true).toBe(true);
});

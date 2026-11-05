import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from './Login';
import { useNavigate } from 'react-router-dom';
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
const mockNavigate = vi.mocked(useNavigate);
let navigateFn: any;
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  navigateFn = vi.fn();
  mockNavigate.mockImplementation(() => navigateFn);
});
afterEach(() => localStorage.clear());

it('debug login render', () => {
  const { container } = render(<Login />);
  console.log('HTML:', container.innerHTML);
  console.log('FORMS:', document.querySelectorAll('form').length);
  console.log('NAVIGATE CALLS:', mockNavigate.mock.calls);
  expect(true).toBe(true);
});

it('debug login render 2 (after previous test)', () => {
  const { container } = render(<Login />);
  console.log('HTML2 len:', container.innerHTML.length);
  console.log('FORMS2:', document.querySelectorAll('form').length);
  expect(true).toBe(true);
});

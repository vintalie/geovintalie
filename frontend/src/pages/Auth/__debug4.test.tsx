import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import Login from './Login';
import * as authApi from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import { render } from '@/test/render';

vi.mock('react-router-dom', async (importOriginal: () => Promise<any>) => {
  const actual = (await importOriginal()) as typeof import('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});
vi.mock('@/api/auth', () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn(), me: vi.fn(), refresh: vi.fn(), updateUser: vi.fn() }));
const mockNavigate = vi.mocked(useNavigate);
let navigateFn: any;
beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); navigateFn = vi.fn(); mockNavigate.mockImplementation(() => navigateFn); });
afterEach(() => localStorage.clear());

describe('d', () => {
  it('primeiro render', () => { render(<Login />); });
  it('clica tab depois de render anterior', async () => {
    const user = userEvent.setup();
    render(<Login />);
    await user.click(screen.getByRole('tab', { name: /criar conta/i }));
    console.log('FORMS:', document.querySelectorAll('form').length);
    console.log('NAVIGATE:', mockNavigate.mock.calls.length);
    expect(document.querySelectorAll('form').length).toBe(2);
  });
});

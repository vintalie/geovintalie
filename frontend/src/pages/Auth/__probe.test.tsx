import { test, expect, vi } from 'vitest';
import { render } from '@/test/render';
import Login from './Login';

vi.mock('react-router-dom', async (importOriginal: () => Promise<any>) => {
  const actual = (await importOriginal()) as typeof import('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});
vi.mock('@/api/auth', () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn(), me: vi.fn(), refresh: vi.fn(), updateUser: vi.fn() }));

test('probe login html', () => {
  const { container } = render(<Login />);
  // eslint-disable-next-line no-console
  console.log(container.innerHTML);
  expect(container).toBeInTheDocument();
});

import { describe, it, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/render';
import DeleteAccount from './DeleteAccount';
import * as consentApi from '@/api/user-consent';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/api/user-consent');
vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockUseAuth.mockReturnValue({
    user: { id: 7, name: 'Usuario Teste', email: 'usuario@test.com' },
    loading: false,
    logout: vi.fn(),
  } as any);
});

describe('debug8', () => {
  it('inline open toggle', async () => {
    render(<DeleteAccount />);
    console.log('trigger count:', screen.getAllByRole('button', { name: /confirmar exclus/i }).length);
    console.log('heading before:', screen.queryByRole('heading', { name: /Confirmar exclusao/i })?.textContent);
    fireEvent.click(screen.getAllByRole('button', { name: /confirmar exclus/i })[0]);
    console.log('trigger count after:', screen.getAllByRole('button', { name: /confirmar exclus/i }).length);
    console.log('buttons after:', screen.getAllByRole('button').map((b) => b.textContent));
    console.log('heading after:', screen.queryByRole('heading', { name: /Confirmar exclusao/i })?.textContent);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Confirmar exclusao/i })).toBeInTheDocument(),
    );
  });
});

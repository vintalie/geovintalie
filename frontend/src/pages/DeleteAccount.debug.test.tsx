import { describe, it, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { render } from '@/test/render';
import DeleteAccount from './DeleteAccount';
import * as consentApi from '@/api/user-consent';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/api/user-consent');
vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockDeleteAccount = vi.mocked(consentApi.deleteAccount);
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

describe('debug7', () => {
  it('inspect React 19 onClick$ property on portaled button', async () => {
    mockDeleteAccount.mockResolvedValueOnce({} as any);
    render(<DeleteAccount />);

    fireEvent.click(
      screen.getAllByRole('button', { name: /confirmar exclus/i })[0],
    );
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /Confirmar exclusão/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.input(screen.getByLabelText('Senha atual'), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByLabelText(/Confirmo que desejo excluir/));

    const btn = screen.getByRole('button', { name: 'Excluir conta' });
    const keys = Object.keys(btn as any).filter((k) => k.startsWith('on'));
    console.log('on* props on button:', keys);
    console.log('onClick$ type:', typeof (btn as any).onClick$);
    if (typeof (btn as any).onClick$ === 'function') {
      await act(() => {
        (btn as any).onClick$();
      });
      console.log('after onClick$() calls:', mockDeleteAccount.mock.calls);
      console.log('logout calls:', mockUseAuth.mock.results[0]?.value.logout?.mock.calls.length ?? 'n/a');
    }
  });
});

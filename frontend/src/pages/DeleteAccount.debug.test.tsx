import { describe, it, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('debug5', () => {
  it('click approaches on portaled button', async () => {
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
    console.log('disabled:', btn.disabled);
    fireEvent.click(btn);
    console.log('after fireEvent.click calls:', mockDeleteAccount.mock.calls.length);

    const user = userEvent.setup();
    await user.click(btn);
    console.log('after userEvent.click calls:', mockDeleteAccount.mock.calls.length);
  });
});

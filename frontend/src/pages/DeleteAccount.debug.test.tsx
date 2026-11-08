import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('debug2', () => {
  it('traces delete flow', async () => {
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

    const checkbox = screen.getByLabelText(/Confirmo que desejo excluir/);
    fireEvent.click(checkbox);
    await new Promise((r) => setTimeout(r, 50));
    console.log('checkbox aria-checked:', checkbox.getAttribute('aria-checked'));

    const allButtons = screen.getAllByRole('button');
    console.log('all buttons:', allButtons.map((b) => [b.textContent, b.disabled, b.getAttribute('aria-label')]));

    try {
      const btn = screen.getByRole('button', { name: /excluir conta/ });
      console.log('FOUND via role, disabled:', btn.disabled);
      fireEvent.click(btn);
    } catch (e: any) {
      console.log('role query failed:', e.message);
    }
    try {
      const el = screen.getByText('Excluir conta');
      console.log('FOUND via text:', (el as HTMLElement).tagName, 'disabled:', (el as HTMLElement).getAttribute('disabled'));
    } catch (e: any) {
      console.log('text query failed:', e.message);
    }

    await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalledTimes(1), { timeout: 5000 });
    console.log('deleteAccount calls:', mockDeleteAccount.mock.calls);
  });
});

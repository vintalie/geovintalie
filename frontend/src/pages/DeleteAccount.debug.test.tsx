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

describe('DeleteAccount', () => {
  it('exclui a conta apos confirmacao no dialogo', async () => {
    mockDeleteAccount.mockResolvedValueOnce({} as any);

    const user = { id: 7, name: 'Usuario Teste', email: 'usuario@test.com' };
    mockUseAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn(),
    } as any);

    render(<DeleteAccount />);

    console.log('=== BEFORE CLICK ===');
    const triggers = screen.getAllByRole('button', { name: /Confirmar/i });
    console.log('Trigger count:', triggers.length);
    console.log('Trigger text:', triggers[0]?.textContent);

    fireEvent.click(triggers[0]);
    console.log('=== AFTER CLICK ===');
    const triggersAfter = screen.getAllByRole('button', { name: /Confirmar/i });
    console.log('Trigger count after:', triggersAfter.length);
    console.log('Any open buttons:', screen.getAllByRole('button').map(b => ({text: b.textContent, role: b.role})));
    console.log('Heading present?:', screen.queryByRole('heading', { name: /Confirmar exclusão/i })?.textContent);
    await waitFor(() =>
      expect(screen.getByText(/Confirmar exclusão/i)).toBeInTheDocument()
    );
    console.log('=== AFTER WAITFOR ===');
    console.log('Heading after:', screen.getByRole('heading', { name: /Confirmar exclusão/i })?.textContent);
    
    fireEvent.input(screen.getByLabelText('Senha atual'), {
      target: { value: 'senha123' },
    });
    console.log('Password set, any enabled buttons?:', screen.getAllByRole('button').map(b => ({text: b.textContent, disabled: b.disabled})));
    
    fireEvent.click(screen.getByLabelText(/Confirmo que desejo excluir/));
    console.log('=== AFTER CHECKBOX CLICK ===');
    console.log('Any buttons:', screen.getAllByRole('button').map(b => ({text: b.textContent, disabled: b.disabled})));
    
    fireEvent.click(screen.getByRole('button', { name: /excluir conta/i }));
    console.log('=== AFTER EXCLUIR CLICK ===');
    await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalledTimes(1));
    console.log('deleteAccount called:', mockDeleteAccount?.mock?.calls?.length, 'times');
    expect(mockDeleteAccount).toHaveBeenCalledWith({
      password: 'senha123',
      confirm_delete: true,
    });
  });
});
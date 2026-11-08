import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/render';
import PrivacyConsent from './PrivacyConsent';
import DataExport from './DataExport';
import DeleteAccount from './DeleteAccount';
import * as consentApi from '@/api/user-consent';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

// Add debug logs for DeleteAccount test
vi.mock('@/api/user-consent');
vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
const mockDeleteAccount = vi.mocked(consentApi.deleteAccount);
const mockUseAuth = vi.mocked(useAuth);

const consentMock = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  user_id: 7,
  purpose: 'marketing',
  granted: false,
  granted_at: null,
  ...overrides,
});

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
  const consentsPage = [
    consentMock({ purpose: 'marketing', granted: false }),
    { ...consentMock({ id: 2, purpose: 'analytics', granted: true }) },
    { ...consentMock({ id: 3, purpose: 'third_party', granted: false }) },
  ];


  it('exclui a conta apos confirmacao no dialogo', async () => {
    mockDeleteAccount.mockResolvedValueOnce({} as any);

    const user = { id: 7, name: 'Usuario Teste', email: 'usuario@test.com' };
    mockUseAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn(),
    } as any);

    console.log('--- DELETE ACCOUNT DEBUG ---');
    render(<DeleteAccount />);
    
    fireEvent.click(screen.getAllByRole('button', { name: /confirmar exclus/i })[0]);
    console.log('Trigger button count after click:', screen.getAllByRole('button', { name: /confirmar exclus/i }).length);
    
    console.log('Heading before waitFor:', screen.queryByRole('heading', { name: /Confirmar exclusão/i })?.textContent);
    
    await waitFor(() => {
          console.log('Waiting for heading...');
          expect(screen.getByText(/Confirmar exclusão/i)).toBeInTheDocument();
        });

        console.log('Heading after waitFor:', screen.getByText(/Confirmar exclusão/i)?.textContent);
    
    fireEvent.input(screen.getByLabelText('Senha atual'), {
      target: { value: 'senha123' },
    });
    
    console.log('Confirm button count:', screen.getAllByRole('button', { name: /Confirmo que desejo excluir/i }).length);
    
    fireEvent.click(screen.getByLabelText(/Confirmo que desejo excluir/));
    console.log('Excluir conta button count:', screen.getAllByRole('button', { name: /excluir conta/i }).length);
    
    await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalledTimes(1));
    expect(mockDeleteAccount).toHaveBeenCalledWith({
      password: 'senha123',
      confirm_delete: true,
    });
    expect(mockUseAuth.mock.results[0]?.value.logout).toHaveBeenCalledTimes(1);
    expect(user.email).toBe('usuario@test.com');
  });
});
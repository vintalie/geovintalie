import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/render';
import PrivacyConsent from './PrivacyConsent';
import DataExport from './DataExport';
import DeleteAccount from './DeleteAccount';
import * as consentApi from '@/api/user-consent';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

vi.mock('@/api/user-consent');
vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockGetConsents = vi.mocked(consentApi.getConsents);
const mockAcceptConsent = vi.mocked(consentApi.acceptConsent);
const mockRevokeConsent = vi.mocked(consentApi.revokeConsent);
const mockExportData = vi.mocked(consentApi.exportData);
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

describe('PrivacyConsent', () => {
  const consentsPage = [
    consentMock({ purpose: 'marketing', granted: false }),
    { ...consentMock({ id: 2, purpose: 'analytics', granted: true }) },
    { ...consentMock({ id: 3, purpose: 'third_party', granted: false }) },
  ];

  it('renderiza os tres propósitos de consentimento (marketing, analytics, third_party)', async () => {
    mockGetConsents.mockResolvedValue({ data: { data: consentsPage } } as any);

    render(<><Toaster /><PrivacyConsent /></>);

    await waitFor(() =>
      expect(screen.getByText('Marketing e comunicacoes')).toBeInTheDocument()
    );
    expect(
      screen.getByText('Analytics e desempenho')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Compartilhamento com terceiros')
    ).toBeInTheDocument();
    expect(mockGetConsents).toHaveBeenCalledTimes(1);
  });

  it('aceita um consentimento de finalidade via POST /api/v2/user-consents', async () => {
    mockGetConsents.mockResolvedValue({ data: { data: consentsPage } } as any);

    render(<><Toaster /><PrivacyConsent /></>);

    await waitFor(() =>
      expect(screen.getByText('Marketing e comunicacoes')).toBeInTheDocument()
    );

    const switches = screen.getAllByRole('switch');
    // marketing vem primeiro e esta nao aceito
    expect(switches[0]).not.toBeChecked();
    fireEvent.click(switches[0]);

    expect(mockAcceptConsent).toHaveBeenCalledWith('marketing', true);

    await waitFor(() =>
      expect(
        screen.getByText(/Consentimento aceito: Marketing e comunicacoes./)
      ).toBeInTheDocument()
    );
  });

  it('revoga um consentimento ja aceito via DELETE /api/v2/user-consents/:id', async () => {
    mockGetConsents.mockResolvedValue({ data: { data: consentsPage } } as any);

    render(<><Toaster /><PrivacyConsent /></>);

    await waitFor(() =>
      expect(screen.getByText('Analytics e desempenho')).toBeInTheDocument()
    );

    const switches = screen.getAllByRole('switch');
    // analytics vem segundo e esta aceito
    expect(switches[1]).toBeChecked();
    fireEvent.click(switches[1]);

    expect(mockRevokeConsent).toHaveBeenCalledWith('analytics');

    await waitFor(() =>
      expect(
        screen.getByText(/Consentimento revogado: Analytics e desempenho./)
      ).toBeInTheDocument()
    );
  });

  it('faz rollback e exibe erro quando a atualizacao falha', async () => {
    mockGetConsents.mockResolvedValue({ data: { data: consentsPage } } as any);
    mockAcceptConsent.mockRejectedValueOnce({
      response: { data: { message: 'Falha ao atualizar' } },
    } as any);

    render(<><Toaster /><PrivacyConsent /></>);

    await waitFor(() =>
      expect(screen.getByText('Marketing e comunicacoes')).toBeInTheDocument()
    );

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);

    await waitFor(() =>
      expect(screen.getByText(/Falha ao atualizar/)).toBeInTheDocument()
    );
    // estado reverte para nao aceito
    expect(switches[0]).not.toBeChecked();
  });
});

describe('DataExport', () => {
  it('exporta os dados pessoais e dispara download', async () => {
    mockExportData.mockResolvedValueOnce(
      { data: { name: 'Usuario Teste', emails: ['usuario@test.com'] } } as any
    );

    render(<><Toaster /><DataExport /></>);

    fireEvent.click(screen.getByRole('button', { name: /exportar meus dados/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Visualizacao dos dados exportados/i),
      ).toBeInTheDocument()
    );
    expect(mockExportData).toHaveBeenCalledTimes(1);
  });
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

    fireEvent.click(
      screen.getAllByRole('button', { name: /confirmar exclus/i })[0]
    );
    await waitFor(() =>
      expect(screen.getByText(/Confirmar exclusão/i)).toBeInTheDocument()
    );

    fireEvent.input(screen.getByLabelText('Senha atual'), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /excluir/i }));
    fireEvent.click(screen.getByRole('button', { name: /excluir conta/i }));
    await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalledTimes(1));
    expect(mockDeleteAccount).toHaveBeenCalledWith({
      password: 'senha123',
      confirm_delete: true,
    });
    expect(mockUseAuth.mock.results[0]?.value.logout).toHaveBeenCalledTimes(1);
    expect(user.email).toBe('usuario@test.com');
  });
});
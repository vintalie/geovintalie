import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/render';
import PrivacyConsent from './PrivacyConsent';
import DataExport from './DataExport';
import DeleteAccount from './DeleteAccount';
import * as consentApi from '@/api/user-consent';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/api/user-consent');
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockGetConsents = vi.mocked(consentApi.getConsents);
const mockAcceptConsent = vi.mocked(consentApi.acceptConsent);
const mockRevokeConsent = vi.mocked(consentApi.revokeConsent);
const mockExportData = vi.mocked(consentApi.exportData);
const mockDeleteAccount = vi.mocked(consentApi.deleteAccount);
const mockUseAuth = vi.mocked(useAuth);

const consentMock = {
  id: 1,
  user_id: 7,
  tipo: 'termo_uso',
  aceito: false,
  aceito_em: null,
  titulo: 'Termos de Uso',
  descricao: 'Aceite os termos de uso da plataforma.',
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockUseAuth.mockReturnValue({
    user: { id: 7, name: 'Usuário Teste', email: 'usuario@test.com' },
    loading: false,
    logout: vi.fn(),
  } as any);
});

describe('PrivacyConsent', () => {
  it('renderiza a lista de consentimentos e permite aceitar/revogar', async () => {
    mockGetConsents.mockResolvedValueOnce(
      { data: { data: [consentMock] } } as any
    );

    render(<PrivacyConsent />);

    await waitFor(() =>
      expect(screen.getByText('Termos de Uso')).toBeInTheDocument()
    );
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(mockGetConsents).toHaveBeenCalledTimes(1);

    const switchEl = screen.getByRole('switch');
    fireEvent.click(switchEl);
    expect(mockAcceptConsent).toHaveBeenCalledWith('termo_uso');

    await waitFor(() =>
      expect(screen.getByText('Consentimento aceito: Termos de Uso.')).toBeInTheDocument()
    );
  });

  it('revoga um consentimento já aceito', async () => {
    mockGetConsents.mockResolvedValueOnce(
      { data: { data: [{ ...consentMock, aceito: true }] } } as any
    );

    render(<PrivacyConsent />);

    await waitFor(() => expect(screen.getByText('Aceito')).toBeInTheDocument());

    const switchEl = screen.getByRole('switch');
    fireEvent.click(switchEl);

    // Atualização otimística reflete a revogação imediatamente.
    expect(screen.getByText('Revogado')).toBeInTheDocument();
    expect(mockRevokeConsent).toHaveBeenCalledWith(1);
  });
});

describe('DataExport', () => {
  it('exporta os dados pessoais e dispara download', async () => {
    mockExportData.mockResolvedValueOnce(
      { data: { name: 'Usuário Teste', emails: ['usuario@test.com'] } } as any
    );

    const downloadSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    render(<DataExport />);

    fireEvent.click(screen.getByRole('button', { name: /exportar meus dados/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/dados exportados com sucesso/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText('Visualização dos dados exportados')).toBeInTheDocument()
    );
    expect(mockExportData).toHaveBeenCalledTimes(1);
    expect(downloadSpy).toHaveBeenCalled();
    downloadSpy.mockRestore();
  });
});

describe('DeleteAccount', () => {
  it('exclui a conta após confirmação no diálogo', async () => {
    mockDeleteAccount.mockResolvedValueOnce({} as any);

    const { user } = mockUseAuth.mock.results[0].value;
    render(<DeleteAccount />);

    fireEvent.click(
      screen.getByRole('button', { name: /confirmar exclusão de conta/i })
    );
    await waitFor(() =>
      expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /excluir conta/i }));
    await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalledTimes(1));
    expect(mockUseAuth.mock.results[0].value.logout).toHaveBeenCalledTimes(1);
    expect(user.email).toBe('usuario@test.com');
  });
});

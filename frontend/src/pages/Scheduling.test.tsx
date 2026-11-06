import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/render';
import Scheduling from './Scheduling';
import * as schedulingApi from '@/api/scheduling';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

vi.mock('@/api/scheduling');
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockGetAppointments = vi.mocked(schedulingApi.getAppointments);
const mockCreateAppointment = vi.mocked(schedulingApi.createAppointment);
const mockCancelAppointment = vi.mocked(schedulingApi.cancelAppointment);
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

describe('Scheduling', () => {
  it('renderiza o formulario de novo agendamento e a lista de agendamentos', async () => {
    mockGetAppointments.mockResolvedValue({ data: { data: [] } } as any);

    render(<><Toaster /><Scheduling /></>);

    await waitFor(() =>
      expect(screen.getByText('Novo agendamento')).toBeInTheDocument(),
    );
    expect(screen.getByText('Meus agendamentos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agendar/ })).toBeInTheDocument();
    expect(mockGetAppointments).toHaveBeenCalledTimes(1);
  });

  it('nao cria agendamento e exibe validacao quando campos estao vazios', async () => {
    mockGetAppointments.mockResolvedValue({ data: { data: [] } } as any);

    render(<><Toaster /><Scheduling /></>);

    await waitFor(() =>
      expect(screen.getByText('Novo agendamento')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Agendar/ }));

    await waitFor(() =>
      expect(
        screen.getByText(/Preencha prestador, servico, data e horario/),
      ).toBeInTheDocument(),
    );
    expect(mockCreateAppointment).not.toHaveBeenCalled();
  });

  it('cancela um agendamento pendente via DELETE /api/v2/appointments/:id', async () => {
    const appointments = [
      {
        id: 10,
        client_id: 7,
        provider_id: 3,
        provider_name: 'Ana Costa - Jardim e Paisagismo',
        client_name: 'Usuario Teste',
        service: 'Manutencao de jardim',
        scheduled_at: '2026-11-20T14:00:00',
        status: 'pending' as const,
        created_at: '2026-11-06T10:00:00Z',
      },
    ];
    mockGetAppointments.mockResolvedValue({ data: { data: appointments } } as any);
    mockCancelAppointment.mockResolvedValue({} as any);
    vi.stubGlobal('confirm', vi.fn(() => true));

    render(<><Toaster /><Scheduling /></>);

    await waitFor(() =>
      expect(
        screen.getByText('Ana Costa - Jardim e Paisagismo'),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/ }));

    await waitFor(() =>
      expect(mockCancelAppointment).toHaveBeenCalledWith(10),
    );
    vi.unstubAllGlobals();
  });
});

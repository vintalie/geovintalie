import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { render } from '@/test/render';
import Reviews from './Reviews';
import * as reviewsApi from '@/api/reviews';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

vi.mock('@/api/reviews');
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockGetReviews = vi.mocked(reviewsApi.getReviews);
const mockCreateReview = vi.mocked(reviewsApi.createReview);
const mockUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  mockUseAuth.mockReturnValue({
    user: { id: 7, name: 'Usuario Teste', email: 'usuario@test.com' },
    loading: false,
    logout: vi.fn(),
  } as any);
});

afterEach(() => {
  cleanup();
});

describe('Reviews', () => {
  it('renderiza as abas de recebidas e enviadas', async () => {
    mockGetReviews.mockResolvedValue({ data: { data: [] } } as any);

    render(<><Toaster /><Reviews /></>);

    await waitFor(() =>
      expect(screen.getByText('Nova avaliacao')).toBeInTheDocument(),
    );
    expect(screen.getByRole('tab', { name: /Recebidas/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Enviadas/ })).toBeInTheDocument();
    expect(
      screen.getByText(/Nenhuma avaliacao recebida ainda/),
    ).toBeInTheDocument();
    // Uma chamada para 'received' e outra para 'sent'
    expect(mockGetReviews).toHaveBeenCalledTimes(2);
    expect(mockGetReviews).toHaveBeenCalledWith({ role: 'received' });
    expect(mockGetReviews).toHaveBeenCalledWith({ role: 'sent' });
  });

  it('envia uma avaliacao via POST /api/v2/reviews', async () => {
    mockGetReviews.mockResolvedValue({ data: { data: [] } } as any);
    mockCreateReview.mockResolvedValue({} as any);

    render(<><Toaster /><Reviews /></>);

    await waitFor(() =>
      expect(screen.getByText('Nova avaliacao')).toBeInTheDocument(),
    );

    const servicoInput = screen.getByPlaceholderText(/ID do servico/);
    fireEvent.change(servicoInput, { target: { value: '3' } });

    const prestadorInput = screen.getByPlaceholderText(/ID do prestador/);
    fireEvent.change(prestadorInput, { target: { value: '9' } });

    // 4 estrelas: botoes sao renderizados de 5 a 1
    fireEvent.click(
      screen.getByRole('button', { name: /4 estrelas - Bom/ }),
    );

    const comentario = screen.getByPlaceholderText(/O que voce achou/);
    fireEvent.change(comentario, { target: { value: 'Otimo atendimento!' } });

    fireEvent.click(screen.getByRole('button', { name: /Enviar avaliacao/ }));

    await waitFor(() =>
      expect(mockCreateReview).toHaveBeenCalledWith({
        service_listing_id: 3,
        service_provider_id: 9,
        rating: 4,
        comment: 'Otimo atendimento!',
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Avaliacao enviada com sucesso/),
      ).toBeInTheDocument(),
    );
  });

  it('bloqueia o envio quando servico ou nota estao faltando', async () => {
    mockGetReviews.mockResolvedValue({ data: { data: [] } } as any);

    render(<><Toaster /><Reviews /></>);

    await waitFor(() =>
      expect(screen.getByText('Nova avaliacao')).toBeInTheDocument(),
    );

    const btn = screen.getByRole('button', { name: /Enviar avaliacao/ });
    expect(btn).toBeDisabled();
    expect(mockCreateReview).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
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
  vi.clearAllMocks();
  localStorage.clear();
  mockUseAuth.mockReturnValue({
    user: { id: 7, name: 'Usuario Teste', email: 'usuario@test.com' },
    loading: false,
    logout: vi.fn(),
  } as any);
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
    expect(screen.getByText(/Nenhuma avaliacao recebida ainda/)).toBeInTheDocument();
    expect(mockGetReviews).toHaveBeenCalledTimes(1);
  });

  it('envia uma avaliacao via POST /api/v2/reviews', async () => {
    mockGetReviews.mockResolvedValue({ data: { data: [] } } as any);
    mockCreateReview.mockResolvedValue({} as any);

    render(<><Toaster /><Reviews /></>);

    await waitFor(() =>
      expect(screen.getByText('Nova avaliacao')).toBeInTheDocument(),
    );

    const prestadorInput = screen.getByPlaceholderText(/ID do prestador/);
    fireEvent.change(prestadorInput, { target: { value: '9' } });

    fireEvent.click(
      screen.getByRole('button', { name: /4 estrelas - Bom/ }),
    );

    const comentario = screen.getByPlaceholderText(/O que voce achou/);
    fireEvent.change(comentario, { target: { value: 'Otimo atendimento!' } });

    fireEvent.click(screen.getByRole('button', { name: /Enviar avaliacao/ }));

    await waitFor(() =>
      expect(mockCreateReview).toHaveBeenCalledWith({
        appointment_id: 0,
        reviewee_id: 9,
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

  it('exibe validacao quando nota nao e preenchida', async () => {
    mockGetReviews.mockResolvedValue({ data: { data: [] } } as any);

    render(<><Toaster /><Reviews /></>);

    await waitFor(() =>
      expect(screen.getByText('Nova avaliacao')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Enviar avaliacao/ }));

    await waitFor(() =>
      expect(
        screen.getByText(/Informe o prestador e uma nota de 1 a 5 estrelas/),
      ).toBeInTheDocument(),
    );
    expect(mockCreateReview).not.toHaveBeenCalled();
  });
});

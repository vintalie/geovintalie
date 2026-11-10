import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, cleanup } from '@testing-library/react';
import { render } from '@/test/render';
import Search from './Search';
import * as searchApi from '@/api/search';
import { Toaster } from '@/components/ui/sonner';

vi.mock('@/api/search');

const mockGetServiceCategories = vi.mocked(searchApi.getServiceCategories);
const mockSearchServices = vi.mocked(searchApi.searchServices);

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('Search', () => {
  it('renderiza a pagina de busca e carrega categorias ao montar', async () => {
    mockGetServiceCategories.mockResolvedValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0, from: null, to: null } },
    } as any);
    mockSearchServices.mockResolvedValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0, from: null, to: null } },
    } as any);

    render(<><Toaster /><Search /></>);

    await waitFor(() =>
      expect(screen.getByText(/Busca de servicos/)).toBeInTheDocument(),
    );
    expect(mockGetServiceCategories).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText(/Titulo ou descricao/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Sao Paulo/)).toBeInTheDocument();
    expect(
      screen.getByText(/Nenhum servico encontrado/),
    ).toBeInTheDocument();
  });

  it('renderiza os servicos retornados pela busca', async () => {
    mockGetServiceCategories.mockResolvedValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0, from: null, to: null } },
    } as any);
    mockSearchServices.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            title: 'Encanador 24h',
            description: 'Reparos hidraulicos',
            price: 150.0,
            city: 'Sao Paulo',
            state: 'SP',
            average_rating: 4.5,
            total_reviews: 12,
            is_active: true,
            provider: { id: 7, business_name: 'Hidraulica Sao Paulo' },
            category: { id: 3, name: 'Encanador', slug: 'encanador' },
          },
        ],
        meta: { current_page: 1, last_page: 1, per_page: 10, total: 1, from: 1, to: 1 },
      },
    } as any);

    render(<><Toaster /><Search /></>);

    await waitFor(() =>
      expect(screen.getByText(/Encanador 24h/)).toBeInTheDocument(),
    );
    expect(mockSearchServices).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, page: 1 }),
    );
    expect(screen.getByText(/R\$ 150,00/)).toBeInTheDocument();
    expect(screen.getByText(/Hidraulica Sao Paulo/)).toBeInTheDocument();
  });
});

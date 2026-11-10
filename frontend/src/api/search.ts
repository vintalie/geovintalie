import api from './axios';
import type { PaginatedResponse } from '@/types';
import type { ServiceCategory, ServiceListing, SearchFilters } from '@/types';

/**
 * Camada de integracao com a busca de servicos do backend (Escopo B2).
 *
 * Contrato da API v2 (alinhado com o backend e com o OpenAPI v2):
 *   GET    /api/v2/service-search      -> busca filtrada (?category_id, ?city, ?state,
 *                                         ?min_rating, ?max_rating, ?min_price, ?max_price,
 *                                         ?q, ?limit, ?page)
 *   GET    /api/v2/service-categories  -> lista de categorias para o filtro
 *
 * O token e injetado automaticamente pelo interceptor de src/api/axios.ts.
 * O endpoint de busca e publico (nao exige autenticacao).
 */

export const getServiceCategories = () =>
  api.get<PaginatedResponse<ServiceCategory>>('/api/v2/service-categories');

export const searchServices = (filters: SearchFilters) =>
  api.get<PaginatedResponse<ServiceListing>>('/api/v2/service-search', {
    params: filters,
  });

export type { ServiceCategory, ServiceListing, SearchFilters };

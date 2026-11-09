import api from './axios';
import type { Review } from '@/types';

/**
 * Camada de integracao com o ReviewController do backend (Escopo B5).
 *
 * Contrato da API v2 (alinhado com o backend):
 *   GET    /api/v2/reviews?role=sent      -> avaliacoes enviadas pelo usuario logado (como cliente)
 *   GET    /api/v2/reviews?role=received  -> avaliacoes recebidas pelo usuario logado (como prestador)
 *   POST   /api/v2/reviews                -> store ({ service_listing_id, service_provider_id, rating, comment })
 *
 * O token e injetado automaticamente pelo interceptor de src/api/axios.ts.
 */

export const getReviews = (params?: { role?: 'sent' | 'received' }) =>
  api.get<{ data: Review[] }>('/api/v2/reviews', { params });

export const createReview = (payload: {
  service_listing_id: number;
  service_provider_id: number;
  rating: number;
  comment: string;
}) => api.post('/api/v2/reviews', payload);

export type { Review };

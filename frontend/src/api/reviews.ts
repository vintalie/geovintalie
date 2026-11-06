import api from './axios';
import type { Review } from '@/types';

/**
 * Camada de integracao com o ReviewsController do backend.
 *
 * Contrato ASSUMIDO (endpoints sob /api/v2/reviews):
 *   GET    /api/v2/reviews?role=received   -> avaliacoes recebidas pelo usuario logado (como prestador)
 *   GET    /api/v2/reviews?role=sent       -> avaliacoes enviadas pelo usuario logado (como cliente)
 *   POST   /api/v2/reviews                 -> store (corpo: { appointment_id, reviewee_id, rating, comment })
 *
 * O token e injetado automaticamente pelo interceptor de src/api/axios.ts.
 * ATENCAO: ajustar nomes de endpoint/corpo conforme o contrato final da API v2.
 */

export const getReviews = (params?: { role?: 'received' | 'sent' }) =>
  api.get<{ data: Review[] }>('/api/v2/reviews', { params });

export const createReview = (payload: {
  appointment_id: number;
  reviewee_id: number;
  rating: number;
  comment: string;
}) => api.post('/api/v2/reviews', payload);

export type { Review };

import api from './axios';
import type { UserConsent } from '@/types';

/**
 * Camada de integracao com o UserConsentController do backend.
 *
 * Contrato assumido (endpoints expostos sob /api/v2/user-consents/*):
 *   GET    /api/v2/user-consents              -> index  (lista de consentimentos do usuario logado)
 *   POST   /api/v2/user-consents              -> store  (aceitar um consentimento; corpo: { tipo })
 *   DELETE /api/v2/user-consents/:id          -> destroy (revogar um consentimento)
 *   GET    /api/v2/user-consents/export       -> export (exportacao dos dados pessoais em JSON)
 *   DELETE /api/v2/user-consents/deleteAccount -> deleteAccount (exclusao definitiva da conta)
 *
 * O token de autenticacao e injetado automaticamente pelo interceptor de src/api/axios.ts.
 * ATENCAO: os nomes exatos de corpo/resposta dependem do contrato final da API v2;
 * ajustar conforme a documentacao do backend.
 */

export const getConsents = (params?: { page?: number; per_page?: number }) =>
  api.get<{ data: UserConsent[] }>('/api/v2/user-consents', { params });

export const acceptConsent = (tipo: string, granted = true) =>
  api.post('/api/v2/user-consents', { tipo, granted });

export const revokeConsent = (id: number | string) =>
  api.delete(`/api/v2/user-consents/${id}`);

/**
 * Exportacao dos dados pessoais. Retorna o corpo JSON da resposta;
 * o caller e responsavel por transformar em download de arquivo.
 */
export const exportData = () => api.get<unknown>('/api/v2/user-consents/export');

export const deleteAccount = (data: {
  password: string;
  confirm_delete: boolean;
}) => api.delete('/api/v2/user-consents/deleteAccount', { data });

export type { UserConsent };

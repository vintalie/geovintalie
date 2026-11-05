import api from './axios';
import type { UserConsent } from '@/types';

/**
 * Camada de integração com o UserConsentController do backend.
 *
 * Contrato assumido (endpoints expostos sob /api/v2/user-consents/*):
 *   GET    /api/v2/user-consents              -> index  (lista de consentimentos do usuário logado)
 *   POST   /api/v2/user-consents              -> store  (aceitar um consentimento; corpo: { tipo })
 *   DELETE /api/v2/user-consents/:id          -> destroy (revogar um consentimento)
 *   GET    /api/v2/user-consents/export       -> export (exportação dos dados pessoais em JSON)
 *   DELETE /api/v2/user-consents/deleteAccount -> deleteAccount (exclusão definitiva da conta)
 *
 * O token de autenticação é injetado automaticamente pelo interceptor de src/api/axios.ts.
 * IMPORTANTE: os nomes exatos de corpo/resposta dependem do contrato final do backend;
 * ajustar conforme a documentação da API v2.
 */

export const getConsents = (params?: { page?: number; per_page?: number }) =>
  api.get<{ data: UserConsent[] }>('/api/v2/user-consents', { params });

export const acceptConsent = (tipo: string) =>
  api.post('/api/v2/user-consents', { tipo });

export const revokeConsent = (id: number | string) =>
  api.delete(`/api/v2/user-consents/${id}`);

/**
 * Exportação dos dados pessoais. Retorna o corpo JSON da resposta;
 * o caller é responsável por transformar em download de arquivo.
 */
export const exportData = () => api.get<unknown>('/api/v2/user-consents/export');

export const deleteAccount = () =>
  api.delete('/api/v2/user-consents/deleteAccount');

export type { UserConsent };

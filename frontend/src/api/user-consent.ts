import api from './axios';
import type { UserConsent } from '@/types';

/**
 * Camada de integracao com o UserConsentController do backend (LGPD - Escopo C3).
 *
 * Contrato da API v2 (backend fonte da verdade):
 *   GET    /api/v2/user-consents              -> index  (consentimentos do usuario logado)
 *   POST   /api/v2/user-consents              -> store  corpo: { purpose: string, granted: boolean }
 *   DELETE /api/v2/user-consents/{purpose}    -> destroy (revogacao por finalidade)
 *   GET    /api/v2/user-consents/export       -> export (todos os dados pessoais do titular em JSON)
 *   DELETE /api/v2/user-consents/account      -> deleteAccount corpo: { password, confirm_delete }
 *
 * O token de autenticacao e injetado automaticamente pelo interceptor de src/api/axios.ts.
 */

export const getConsents = (params?: { page?: number; per_page?: number }) =>
  api.get<{ data: UserConsent[] }>('/api/v2/user-consents', { params });

export const acceptConsent = (tipo: string, granted = true) =>
  api.post('/api/v2/user-consents', { purpose: tipo, granted });

export const revokeConsent = (purpose: string | number) =>
  api.delete(`/api/v2/user-consents/${purpose}`);

/**
 * Exportacao dos dados pessoais (direito de acesso e portabilidade).
 * Retorna o corpo JSON; o caller e responsavel por gerar o download do arquivo.
 */
export const exportData = () => api.get<unknown>('/api/v2/user-consents/export');

export const deleteAccount = (credentials: { password: string; confirm_delete: boolean }) =>
  api.delete('/api/v2/user-consents/deleteAccount', { data: credentials });

export type { UserConsent };

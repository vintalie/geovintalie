import api from './axios';
import type { UserConsent } from '@/types';

/**
 * Camada de integração com o UserConsentController do backend (Escopo C3 - LGPD).
 *
 * Contrato exposto sob /api/v2/user-consents/*:
 *   GET    /api/v2/user-consents          -> index  (lista de consentimentos do usuário logado)
 *   POST   /api/v2/user-consents          -> store  (corpo: { purpose, granted })
 *   DELETE /api/v2/user-consents/:purpose -> destroy (revoga o consentimento da finalidade)
 *   GET    /api/v2/user-consents/export   -> export (dados pessoais do titular em JSON)
 *   DELETE /api/v2/user-consents/account  -> deleteAccount (corpo: { password, confirm_delete })
 *
 * O token de autenticação é injetado automaticamente pelo interceptor de src/api/axios.ts.
 * A rota estática /account é registrada ANTES de /:purpose no backend, de modo que a
 * exclusão de conta nunca é capturada como uma finalidade.
 */

export const getConsents = (params?: { page?: number; per_page?: number }) =>
  api.get<{ data: UserConsent[] }>('/api/v2/user-consents', { params });

export const acceptConsent = (purpose: string, granted: boolean) =>
  api.post('/api/v2/user-consents', { purpose, granted });

export const revokeConsent = (purpose: string) =>
  api.delete(`/api/v2/user-consents/${purpose}`);

/** Exportação dos dados pessoais. Retorna o corpo JSON da resposta. */
export const exportData = () => api.get<unknown>('/api/v2/user-consents/export');

/**
 * Exclusão definitiva da conta (direito ao esquecimento - LGPD).
 * Exige senha confirmada + confirm_delete: true.
 */
export const deleteAccount = (credentials: {
  password: string;
  confirm_delete: boolean;
}) =>
  api.delete('/api/v2/user-consents/account', { data: credentials });

export type { UserConsent };

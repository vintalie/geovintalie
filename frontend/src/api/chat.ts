import api from './axios';
import type { ChatConversation, ChatMessage } from '@/types';

/**
 * Camada de integracao com o ChatController do backend.
 *
 * Contrato ASSUMIDO (endpoints sob /api/v2/chat):
 *   GET    /api/v2/chat/conversations                     -> index (conversas do usuario logado)
 *   GET    /api/v2/chat/conversations/:id/messages        -> show (mensagens de uma conversa)
 *   POST   /api/v2/chat/conversations/:id/messages        -> store (corpo: { body })
 *
 * O token e injetado automaticamente pelo interceptor de src/api/axios.ts.
 * ATENCAO: ajustar nomes de endpoint/corpo conforme o contrato final da API v2.
 */

export const getConversations = () =>
  api.get<{ data: ChatConversation[] }>('/api/v2/chat/conversations');

export const getMessages = (conversationId: number | string) =>
  api.get<{ data: ChatMessage[] }>(
    `/api/v2/chat/conversations/${conversationId}/messages`,
  );

export const sendMessage = (conversationId: number | string, body: string) =>
  api.post(`/api/v2/chat/conversations/${conversationId}/messages`, { body });

export type { ChatConversation, ChatMessage };

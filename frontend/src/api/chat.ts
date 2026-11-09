import api from './axios';
import type { ChatConversation, ChatMessage } from '@/types';

/**
 * Camada de integracao com o ChatController do backend (Escopos B4 e B6).
 *
 * Contrato da API v2 (conforme routes/api.php e contrato OpenAPI):
 *   GET    /api/v2/conversas                                  -> conversas do usuario logado
 *   GET    /api/v2/conversas/:id/mensagens                    -> mensagens de uma conversa
 *   POST   /api/v2/conversas/:id/mensagens                    -> enviar mensagem (texto opcional +
 *                                                                anexo 'file' opcional, multipart)
 *   GET    /api/v2/messages/:id/file                          -> download do anexo da mensagem (blob)
 *
 * O token e injetado automaticamente pelo interceptor de src/api/axios.ts.
 */

export const getConversations = () =>
  api.get<{ data: ChatConversation[] }>('/api/v2/conversas');

export const getMessages = (conversationId: number | string) =>
  api.get<{ data: ChatMessage[] }>(`/api/v2/conversas/${conversationId}/mensagens`);

export const sendMessage = (
  conversationId: number | string,
  body: string,
  file?: File,
) => {
  const formData = new FormData();
  formData.append('body', body);
  if (file) {
    formData.append('file', file);
  }

  return api.post(
    `/api/v2/conversas/${conversationId}/mensagens`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
};

export const downloadMessageFile = (messageId: number | string) =>
  api.get(`/api/v2/messages/${messageId}/file`, {
    responseType: 'blob',
  });

export type { ChatConversation, ChatMessage };

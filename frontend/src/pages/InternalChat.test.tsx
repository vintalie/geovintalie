import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/render';
import InternalChat from './InternalChat';
import * as chatApi from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

vi.mock('@/api/chat');
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockGetConversations = vi.mocked(chatApi.getConversations);
const mockGetMessages = vi.mocked(chatApi.getMessages);
const mockSendMessage = vi.mocked(chatApi.sendMessage);
const mockUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockUseAuth.mockReturnValue({
    user: { id: 7, name: 'Usuario Teste', email: 'usuario@test.com' },
    loading: false,
    logout: vi.fn(),
  } as any);
});

describe('InternalChat', () => {
  it('renderiza a lista de conversas', async () => {
    mockGetConversations.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            participant_id: 22,
            participant_name: 'Maria Oliveira - Limpeza e Conservacao',
            participant_role: 'provider',
            last_message: 'Oi, tudo bem?',
            last_message_at: '2026-11-06T10:00:00Z',
            unread_count: 2,
          },
        ],
      },
    } as any);

    render(<><Toaster /><InternalChat /></>);

    await waitFor(() =>
      expect(
        screen.getByText('Maria Oliveira - Limpeza e Conservacao'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(mockGetConversations).toHaveBeenCalledTimes(1);
  });

  it('abre uma conversa e carrega as mensagens via GET .../messages', async () => {
    mockGetConversations.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            participant_id: 22,
            participant_name: 'Joao Santos - Reparos Residencial',
            participant_role: 'provider',
            last_message: 'Oi, tudo bem?',
            last_message_at: '2026-11-06T10:00:00Z',
            unread_count: 0,
          },
        ],
      },
    } as any);
    mockGetMessages.mockResolvedValue({
      data: {
        data: [
          {
            id: 100,
            conversation_id: 1,
            sender_id: 22,
            sender_name: 'Joao Santos - Reparos Residencial',
            body: 'Oi, tudo bem?',
            created_at: '2026-11-06T10:00:00Z',
            mine: false,
          },
        ],
      },
    } as any);

    render(<><Toaster /><InternalChat /></>);

    await waitFor(() =>
      expect(
        screen.getByText('Joao Santos - Reparos Residencial'),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Joao Santos/ }));

    await waitFor(() =>
      expect(mockGetMessages).toHaveBeenCalledWith(1),
    );
    await waitFor(() =>
      expect(screen.getByText('Oi, tudo bem?')).toBeInTheDocument(),
    );
  });

  it('envia uma mensagem via POST .../messages', async () => {
    mockGetConversations.mockResolvedValue({
      data: { data: [] },
    } as any);

    render(<><Toaster /><InternalChat /></>);

    await waitFor(() =>
      expect(
        screen.getByText('Selecione uma conversa para iniciar o chat.'),
      ).toBeInTheDocument(),
    );
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});

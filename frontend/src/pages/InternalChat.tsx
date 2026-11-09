import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getConversations,
  getMessages,
  sendMessage,
  type ChatConversation,
  type ChatMessage,
} from '@/api/chat';
import { mensagemSchema } from '@/lib/validations';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const InternalChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [active, setActive] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const response = await getConversations();
      const data = response.data?.data ?? response.data ?? [];
      setConversations(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel carregar as conversas.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const selectConversation = async (conversation: ChatConversation) => {
    setActive(conversation);
    setMessages([]);
    try {
      const response = await getMessages(conversation.id);
      const data = response.data?.data ?? response.data ?? [];
      setMessages(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel carregar as mensagens.',
      );
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    const corpo = body.trim();
    const validacao = mensagemSchema.safeParse({ body: corpo });
    if (!validacao.success) return;
    setSending(true);
    try {
      await sendMessage(active.id, corpo);
      const optimistic: ChatMessage = {
        id: Date.now(),
        conversation_id: active.id,
        sender_id: user?.id ?? 0,
        sender_name: user?.name ?? 'Voce',
        body: corpo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        read_at: null,
        sender: {
          id: user?.id ?? 0,
          name: user?.name ?? 'Voce',
          email: user?.email ?? '',
        },
        mine: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      setBody('');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Nao foi possivel enviar a mensagem.',
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-card">
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <MessageCircle className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Carregando conversas...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <Card className="shadow-card h-[calc(100vh-2rem)] flex flex-col md:h-auto md:flex-row">
        <div className="flex-1 border-r bg-secondary/50 flex flex-col">
          <CardHeader className="border-b p-4">
            <CardTitle className="text-base">Conversas</CardTitle>
            <CardDescription className="text-xs">
              Mensagens trocadas com clientes e prestadores.
            </CardDescription>
          </CardHeader>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma conversa ainda.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 text-left transition-colors',
                    active?.id === c.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted',
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.participant_name ?? ''}`}
                    >
                      <AvatarFallback>
                        {(c.participant_name ?? '').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </AvatarImage>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {c.participant_name ?? 'Sem nome'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.last_message ?? ''}
                    </div>
                  </div>
                  {(c.unread_count ?? 0) > 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      {c.unread_count ?? 0}
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          {active ? (
            <>
              <CardHeader className="border-b px-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${active.participant_name ?? ''}`}
                    >
                      <AvatarFallback>
                        {(active.participant_name ?? '').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </AvatarImage>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {active.participant_name ?? 'Sem nome'}
                      <span className="text-xs font-normal ml-2">
                        ({active.participant_role ?? ''})
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">Online</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground">
                    Nenhuma mensagem ainda.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.mine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm break-words ${
                          m.mine
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {m.body}
                      </div>
                      <time
                        className={`text-xs text-muted-foreground mt-0.5 ${
                          m.mine ? 'ml-auto' : ''
                        }`}
                      >
                        {formatTime(m.created_at)}
                      </time>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="border-t p-4 gap-2">
                <div className="flex items-end gap-2">
                  <Input
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Escreva uma mensagem..."
                    disabled={sending}
                    className="flex-1 min-w-0"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !body.trim()}
                    className="h-9"
                    aria-label="Enviar mensagem"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="h-10 w-10 opacity-20 mb-2" />
              <p className="text-sm">Selecione uma conversa para iniciar o chat.</p>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
};

export default InternalChat;

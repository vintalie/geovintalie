import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Download, MessageCircle, Paperclip, Send } from 'lucide-react';

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
  downloadMessageFile,
  type ChatConversation,
  type ChatMessage,
} from '@/api/chat';
import { mensagemSchema } from '@/lib/validations';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatFileSize = (bytes: number | null | undefined) => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, alinhado ao backend

const InternalChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [active, setActive] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
        error.response?.data?.message || 'Nao foi possivel carregar as mensagens.',
      );
    }
  };

  useEffect(() => {
    if (
      typeof messagesEndRef.current?.scrollIntoView === 'function'
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleDownload = async (message: ChatMessage) => {
    if (!message.has_attachment) return;
    try {
      const response = await downloadMessageFile(message.id);
      const blob = response.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = message.file_name ?? 'anexo';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Nao foi possivel baixar o anexo.');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    const corpo = body.trim();
    const validacao = mensagemSchema.safeParse({ body: corpo });
    if (!validacao.success) return;
    if (!corpo && !selectedFile) {
      toast.error('Digite uma mensagem ou selecione um arquivo para enviar.');
      return;
    }
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      toast.error('O arquivo e muito grande. Limite: 10 MB.');
      return;
    }
    setSending(true);
    const arquivoParaEnviar = selectedFile;
    try {
      await sendMessage(active.id, corpo, arquivoParaEnviar ?? undefined);
      const agora = new Date().toISOString();
      const optimistic: ChatMessage = {
        id: Date.now(),
        conversation_id: active.id,
        sender_id: user?.id ?? 0,
        body: corpo,
        read_at: null,
        created_at: agora,
        updated_at: agora,
        sender: {
          id: user?.id ?? 0,
          name: user?.name ?? 'Voce',
          email: user?.email ?? '',
        },
        mine: true,
        ...(arquivoParaEnviar
          ? {
              has_attachment: true,
              file_name: arquivoParaEnviar.name,
              file_mime: arquivoParaEnviar.type,
              file_size: arquivoParaEnviar.size,
            }
          : {}),
      };
      setMessages((prev) => [...prev, optimistic]);
      setBody('');
      setSelectedFile(null);
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
                  messages.map((m) => {
                    const mine = m.mine ?? m.is_mine ?? false;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm break-words ${
                            mine
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                        {m.body && <span>{m.body}</span>}
                        {m.has_attachment && (
                          <>
                            {m.body && <br />}
                            <span className="block text-[0.8rem] opacity-90">
                              📎 {m.file_name ?? 'Anexo'}
                              {m.file_size != null && (
                                <span className="ml-1">({formatFileSize(m.file_size)})</span>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {m.has_attachment && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(m);
                            }}
                            className="text-xs underline underline-offset-2 hover:text-primary"
                            title={`Baixar ${m.file_name ?? 'anexo'}`}
                          >
                            <Download className="h-3 w-3" /> Baixar
                          </button>
                        )}
                        <time
                          className={`text-xs text-muted-foreground ${
                            mine ? 'ml-auto' : ''
                          }`}
                        >
                          {formatTime(m.created_at)}
                        </time>
                      </div>
                    </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="border-t p-4 gap-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 min-w-0 flex gap-2">
                    <Input
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Escreva uma mensagem..."
                      disabled={sending}
                      className="flex-1 min-w-0"
                    />
                    <label
                      htmlFor="chat-anexo"
                      className={cn(
                        'inline-flex items-center justify-center rounded-lg border border-muted px-2 py-1.5 text-xs font-medium transition-colors',
                        sending
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-muted cursor-pointer',
                      )}
                      title="Anexar arquivo"
                    >
                      <Paperclip className="h-3 w-3 mr-1.5" />
                      Anexar
                      <input
                        id="chat-anexo"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.csv,.rtf,.odt,.zip,.jpg,.jpeg,.png,.webp,.gif,.mp3,.wav,.ogg,.m4a,.xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          if (file && file.size > MAX_FILE_SIZE) {
                            toast.error('O arquivo e muito grande. Limite: 10 MB.');
                            return;
                          }
                          setSelectedFile(file);
                        }}
                        className="hidden"
                        data-testid="chat-file-input"
                      />
                    </label>
                    {selectedFile && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFile(null)}
                        disabled={sending}
                        className="ml-1 h-9"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      sending || (!body.trim() && !selectedFile)
                    }
                    className="h-9"
                    aria-label="Enviar mensagem"
                    data-testid="chat-send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {selectedFile && !sending && (
                  <p className="text-xs text-muted-foreground text-right">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
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

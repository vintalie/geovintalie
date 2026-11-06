import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getReviews,
  createReview,
  type Review,
} from '@/api/reviews';

const STAR_LABELS: Record<number, string> = {
  1: '1 estrela - Insatisfatorio',
  2: '2 estrelas - Ruim',
  3: '3 estrelas - Regular',
  4: '4 estrelas - Bom',
  5: '5 estrelas - Excelente',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const starsOf = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => i < rating);

const ReviewCard = ({ review, role }: { review: Review; role: 'client' | 'provider' }) => (
  <Card className="shadow-card">
    <CardContent className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewer_name}`}
          >
            <AvatarFallback>
              {review.reviewer_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </AvatarImage>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-sm">{review.reviewer_name}</span>
            <div className="flex items-center gap-0.5 text-yellow-500">
              {starsOf(review.rating).map(() => (
                <Star key="s" className="h-3 w-3 text-yellow-500" />
              ))}
              {Array.from({ length: 5 - review.rating }).map(() => (
                <Star key="e" className="h-3 w-3 text-muted-foreground" />
              ))}
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {role === 'client' ? 'Avaliou voce (prestador)' : 'Voce avaliou'} •{' '}
            {formatDate(review.created_at)}
          </span>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      )}
    </CardContent>
  </Card>
);

const Reviews = () => {
  const [received, setReceived] = useState<Review[]>([]);
  const [sent, setSent] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [revieweeId, setRevieweeId] = useState<number | ''>('');

  const loadReviews = useCallback(async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        getReviews({ role: 'received' }),
        getReviews({ role: 'sent' }),
      ]);
      setReceived(
        Array.isArray(receivedRes.data?.data) ? receivedRes.data.data : [],
      );
      setSent(Array.isArray(sentRes.data?.data) ? sentRes.data.data : []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel carregar as avaliacoes.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revieweeId || !rating || rating < 1 || rating > 5) {
      toast.error('Informe o prestador e uma nota de 1 a 5 estrelas.');
      return;
    }
    setSending(true);
    try {
      await createReview({
        appointment_id: 0,
        reviewee_id: Number(revieweeId),
        rating,
        comment: comment.trim(),
      });
      toast.success('Avaliacao enviada com sucesso.');
      setRevieweeId('');
      setRating(0);
      setComment('');
      await loadReviews();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Nao foi possivel enviar a avaliacao.',
      );
    } finally {
      setSending(false);
    }
  };

  const tabFor = useMemo(
    () => ({
      received,
      sent,
    }),
    [received, sent],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-card">
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <Star className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Carregando avaliacoes...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Star className="h-5 w-5" /> Avaliacoes mutuas
          </CardTitle>
          <CardDescription>
            Avalie prestadores dos atendimentos concluidos e veja as
            avaliacoes que recebeu como prestador. Cliente e prestador avaliam
            um ao outro apos a finalizacao do servico.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="w-[320px]">
              <TabsTrigger value="received">Recebidas</TabsTrigger>
              <TabsTrigger value="sent">Enviadas</TabsTrigger>
            </TabsList>
            <TabsContent value="received" className="mt-4 space-y-3">
              <CardDescription>
                Avaliacoes que voce recebeu (como prestador)
              </CardDescription>
              {tabFor.received.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma avaliacao recebida ainda.
                </div>
              ) : (
                tabFor.received.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    role="provider"
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="sent" className="mt-4 space-y-3">
              <CardDescription>
                Avaliacoes que voce enviou (como cliente)
              </CardDescription>
              {tabFor.sent.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma avaliacao enviada ainda.
                </div>
              ) : (
                tabFor.sent.map((r) => (
                  <ReviewCard key={r.id} review={r} role="client" />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-card max-w-md">
        <CardHeader>
          <CardTitle>Nova avaliacao</CardTitle>
          <CardDescription>
            Avalie um prestador apos a conclusao de um agendamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Prestador (ID)</Label>
              <Input
                type="number"
                value={String(revieweeId ?? '')}
                onChange={(e) => setRevieweeId(e.target.value ? Number(e.target.value) : '')}
                placeholder="ID do prestador"
                disabled={sending}
              />
            </div>
            <div className="space-y-2">
              <Label>Nota</Label>
              <div className="flex items-center gap-1">
                {[5, 4, 3, 2, 1].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={rating >= n ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRating(n)}
                    aria-label={STAR_LABELS[n]}
                    disabled={sending}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                ))}
                <span className="ml-2 text-xs text-muted-foreground">
                  {rating ? STAR_LABELS[rating] : 'Selecione uma nota'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comentario</Label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="O que voce achou do atendimento?"
                disabled={sending}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={
                sending || !revieweeId || !rating || rating < 1 || rating > 5
              }
              className="w-full"
            >
              {sending ? 'Enviando...' : 'Enviar avaliacao'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Reviews;

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  searchServices,
  getServiceCategories,
  type ServiceListing,
  type ServiceCategory,
} from '@/api/search';

const DEFAULT_LIMIT = 10;
const RATING_LABELS: Record<number, string> = {
  1: '1 estrela',
  2: '2 estrelas',
  3: '3 estrelas',
  4: '4 estrelas',
  5: '5 estrelas',
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const starsOf = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));

const ListingCard = ({ listing }: { listing: ServiceListing }) => (
  <Card className="shadow-card">
    <CardContent className="p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold leading-tight">{listing.title}</h3>
            {listing.average_rating > 0 && (
              <div className="flex items-center gap-0.5 text-yellow-500">
                {starsOf(listing.average_rating).map(() => (
                  <Star key="s" className="h-3 w-3 fill-yellow-500" />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {listing.average_rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          {listing.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {listing.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {listing.city && <span>{listing.city}</span>}
            {listing.state && <span>{listing.state}</span>}
            <span>{formatMoney(listing.price)}</span>
          </div>
        </div>
        <div className="text-right">
          {listing.category && (
            <Badge variant="outline" className="mb-2">
              {listing.category.name}
            </Badge>
          )}
          <div className="text-lg font-semibold">{formatMoney(listing.price)}</div>
          <span className="text-xs text-muted-foreground">
            {listing.total_reviews} avaliacao{listing.total_reviews !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      {listing.provider && listing.provider.business_name && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Por {listing.provider.business_name}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const SearchPage = () => {
  const [filters, setFilters] = useState<{
    q?: string;
    category_id?: number;
    city?: string;
    state?: string;
    min_rating?: number;
    max_rating?: number;
    min_price?: number;
    max_price?: number;
    limit: number;
    page: number;
  }>({ limit: DEFAULT_LIMIT, page: 1 });
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [results, setResults] = useState<ServiceListing[]>([]);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const response = await getServiceCategories();
      const data = response.data?.data;
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch {
      // Nao bloqueia a busca caso as categorias nao carreguem
    }
  }, []);

  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      const response = await searchServices(filters);
      const data = response.data?.data;
      setResults(Array.isArray(data) ? data : []);
      setMeta(response.data?.meta ?? null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Nao foi possivel buscar os servicos.',
      );
      setResults([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const setFilter = (key: string, value: string | number | undefined) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value, page: 1 };
      if (value === '' || value === undefined) {
        delete next[key];
      }
      return next;
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-card">
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <Search className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Buscando servicos...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Search className="h-5 w-5" /> Busca de servicos
              </CardTitle>
              <CardDescription>
                Encontre prestadores filtrando por categoria, localizacao,
                avaliacao e preco.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Refine os resultados antes de escolher um prestador.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Buscar por texto</Label>
              <Input
                placeholder="Titulo ou descricao"
                value={filters.q ?? ''}
                onChange={(e) => setFilter('q', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={String(filters.category_id ?? '')}
                onValueChange={(value) =>
                  setFilter(
                    'category_id',
                    value === '' ? undefined : Number(value),
                  )
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                placeholder="Sao Paulo"
                value={filters.city ?? ''}
                onChange={(e) => setFilter('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                placeholder="SP"
                value={filters.state ?? ''}
                onChange={(e) => setFilter('state', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Avaliacao minima</Label>
              <Select
                value={String(filters.min_rating ?? '')}
                onValueChange={(value) =>
                  setFilter(
                    'min_rating',
                    value === '' ? undefined : Number(value),
                  )
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {RATING_LABELS[n]} ou mais
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preco minimo (R$)</Label>
              <Input
                type="number"
                value={filters.min_price != null ? String(filters.min_price) : ''}
                onChange={(e) =>
                  setFilter(
                    'min_price',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Preco maximo (R$)</Label>
              <Input
                type="number"
                value={filters.max_price != null ? String(filters.max_price) : ''}
                onChange={(e) =>
                  setFilter(
                    'max_price',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                onClick={() => setFilters((prev) => ({ ...prev, page: 1 }))}
                disabled={loading}
                className="w-full"
              >
                Buscar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>
            Resultados
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({meta?.total ?? 0})
            </span>
          </CardTitle>
          <CardDescription>
            {meta ? (
              <>
                Pagina <strong>{meta.current_page}</strong> de{' '}
                <strong>{meta.last_page}</strong> -{' '}
                {meta.from} a {meta.to} de {meta.total}
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum servico encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </CardContent>
        {meta && meta.last_page > 1 && (
          <div className="border-t border-input px-4 py-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page <= 1 || loading}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Pagina anterior
            </Button>
            <span className="text-xs text-muted-foreground">
              {meta.current_page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page >= meta.last_page || loading}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Proxima pagina
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
};

export default SearchPage;

import { useCallback, useEffect, useState } from 'react';
import type { Links, Meta, PaginatedResponse } from '../types/pagination';

type FetchFunction<T> = (page: number, perPage: number) => Promise<any>;
type Extractor<T> = (response: any) => PaginatedResponse<T>;

interface UsePaginatedResourceOptions {
  perPage?: number;
  initialPage?: number;
  enabled?: boolean; // nova opção
}

export function usePaginatedResource<T>(
  fetchFn: FetchFunction<T>,
  extractor?: Extractor<T>, // <-- AGORA O SEGUNDO PARÂMETRO É O EXTRACTOR
  options: UsePaginatedResourceOptions = {} // <-- TERCEIRO PARÂMETRO SÃO AS OPÇÕES
) {
  const { perPage = 10, initialPage = 1 } = options;

  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [links, setLinks] = useState<Links | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  const loadData = useCallback(
    async (pageToLoad: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchFn(pageToLoad, perPage);

        // Se tiver extractor, usa ele. Senão, tenta response.data ou a própria response
        let paginated: PaginatedResponse<T>;
        if (extractor) {
          paginated = extractor(response);
        } else {
          // Fallback: assume que response.data é o paginado, ou response direto
          paginated = response.data || response;
        }

        setData(paginated.data);
        setMeta(paginated.meta);
        setLinks(paginated.links);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, perPage, extractor]
  );

  useEffect(() => {
    loadData(page);
  }, [page, loadData]);

  const goToPage = (newPage: number) => {
    if (meta && newPage >= 1 && newPage <= meta.last_page) {
      setPage(newPage);
    }
  };

  const nextPage = () => {
    if (meta && meta.current_page < meta.last_page) {
      goToPage(meta.current_page + 1);
    }
  };

  const prevPage = () => {
    if (meta && meta.current_page > 1) {
      goToPage(meta.current_page - 1);
    }
  };

  const reload = () => loadData(page);

  return {
    data,
    meta,
    links,
    loading,
    error,
    page,
    perPage,
    goToPage,
    nextPage,
    prevPage,
    reload,
  };
}
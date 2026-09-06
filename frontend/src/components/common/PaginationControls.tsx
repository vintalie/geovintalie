import React from 'react';
import type { Links, Meta } from '../../types/index';

interface PaginationControlsProps {
  meta: Meta;
  links: Links;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  meta,
  links,
  onPageChange,
  onNext,
  onPrev,
}) => {
  const { current_page, last_page } = meta;

  // Gera um array de números de página para exibir (ex: 1,2,3,...,último)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const total = last_page;
    const current = current_page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      // Sempre mostra a primeira, última, e algumas ao redor da atual
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      if (total > 1) pages.push(total);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={onPrev}
          disabled={!links.prev}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={onNext}
          disabled={!links.next}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{meta.from ?? 0}</span> a{' '}
            <span className="font-medium">{meta.to ?? 0}</span> de{' '}
            <span className="font-medium">{meta.total}</span> resultados
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={onPrev}
              disabled={!links.prev}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Anterior</span>
              &larr;
            </button>

            {pageNumbers.map((p, idx) =>
              typeof p === 'number' ? (
                <button
                  key={idx}
                  onClick={() => onPageChange(p)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    p === current_page
                      ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span
                  key={idx}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                >
                  {p}
                </span>
              )
            )}

            <button
              onClick={onNext}
              disabled={!links.next}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Próxima</span>
              &rarr;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { deleteStreet, getStreets } from '../../../api/location';
import PaginationControls from '../../../components/common/PaginationControls';
import { usePaginatedResource } from '../../../hooks/usePaginatedResource';
import type { Street } from '../../../types';

const StreetsList = () => {
  const fetchStreets = useCallback(
    (page: number, perPage: number) => getStreets({ page, per_page: perPage }),
    []
  );
  const extractStreets = useCallback(
    (response: any) => response.data,
    []
  );

  const {
    data: streets,
    meta,
    links,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    reload,
  } = usePaginatedResource<Street>(
    fetchStreets,
    extractStreets,
    { perPage: 10 }
  );
  console.log(streets)
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await deleteStreet(id);
      // Recarrega a página atual para refletir a exclusão
      reload();
    } catch (err: any) {
      alert('Erro ao deletar');
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ruas</h1>
        <Button asChild variant="default" size="sm">
          <span>Novo País</span>
        </Button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Id do Bairro</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {streets.map((street) => (
            <tr key={street.id} className="border-t">
              <td className="p-2">{street.id}</td>
              <td className="p-2">{street.name}</td>
              <td className="p-2">{street.neighborhood_id}</td>
              <td className="p-2">
                                <Button asChild variant="link" size="sm" className="mr-2">
                  <Link to={`/streets/${street.id}/edit`}>Editar</Link>
                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(street.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controles de paginação */}
      {meta && links && (
        <PaginationControls
          meta={meta}
          links={links}
          onPageChange={goToPage}
          onNext={nextPage}
          onPrev={prevPage}
        />
      )}
    </div>
  );
};

export default StreetsList;
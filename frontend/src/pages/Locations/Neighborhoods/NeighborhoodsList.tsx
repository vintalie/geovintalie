import { Link } from 'react-router-dom';
import { deleteNeighborhood, getNeighborhoods } from '../../../api/location';
import PaginationControls from '../../../components/common/PaginationControls';
import { usePaginatedResource } from '../../../hooks/usePaginatedResource';
import type { Neighborhood } from '../../../types';

const NeighborhoodsList = () => {
  // Hook de paginação – definimos o extrator para pegar response.data.neighborhoods
  const {
    data: neighborhoods,
    meta,
    links,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    reload,
  } = usePaginatedResource<Neighborhood>(
    (page, perPage) => getNeighborhoods({ page, per_page: perPage }),
    (response) => {
    return response.data;

    }, // extrator da parte paginada
    { perPage: 10 }
  );
  console.log(neighborhoods)
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await deleteNeighborhood(id);
      // Recarrega a página atual para refletir a exclusão
      reload();
    } catch (err: any) {
      alert('Erro ao deletar');
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bairros</h1>
        <Link to="/neighborhoods/new" className="bg-blue-500 text-white p-2 rounded">
          Novo País
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Id do Bairro</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {neighborhoods.map((neighborhood) => (
            <tr key={neighborhood.id} className="border-t">
              <td className="p-2">{neighborhood.id}</td>
              <td className="p-2">{neighborhood.name}</td>
              <td className="p-2">{neighborhood.city_id}</td>
              <td className="p-2">
                <Link
                  to={`/neighborhoods/${neighborhood.id}/edit`}
                  className="text-blue-500 mr-2"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(neighborhood.id)}
                  className="text-red-500"
                >
                  Excluir
                </button>
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

export default NeighborhoodsList;
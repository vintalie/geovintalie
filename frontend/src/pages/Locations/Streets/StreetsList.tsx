import { Link } from 'react-router-dom';
import { deleteStreet, getStreets } from '../../../api/location';
import PaginationControls from '../../../components/common/PaginationControls';
import { usePaginatedResource } from '../../../hooks/usePaginatedResource';
import type { Street } from '../../../types';

const StreetsList = () => {
  // Hook de paginação – definimos o extrator para pegar response.data.streets
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
    (page, perPage) => getStreets({ page, per_page: perPage }),
    (response) => {
    return response.data;

    }, // extrator da parte paginada
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
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ruas</h1>
        <Link to="/streets/new" className="bg-blue-500 text-white p-2 rounded">
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
          {streets.map((street) => (
            <tr key={street.id} className="border-t">
              <td className="p-2">{street.id}</td>
              <td className="p-2">{street.name}</td>
              <td className="p-2">{street.neighborhood_id}</td>
              <td className="p-2">
                <Link
                  to={`/streets/${street.id}/edit`}
                  className="text-blue-500 mr-2"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(street.id)}
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

export default StreetsList;
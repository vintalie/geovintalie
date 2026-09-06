import { Link } from 'react-router-dom';
import { deleteCity, getCities } from '../../../api/location';
import PaginationControls from '../../../components/common/PaginationControls';
import { usePaginatedResource } from '../../../hooks/usePaginatedResource';
import type { City } from '../../../types';

const CitiesList = () => {
  // Hook de paginação – definimos o extrator para pegar response.data.cities
  const {
    data: cities,
    meta,
    links,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    reload,
  } = usePaginatedResource<City>(
    (page, perPage) => getCities({ page, per_page: perPage }),
    (response) => {
    return response.data;

    }, // extrator da parte paginada
    { perPage: 10 }
  );
  console.log(cities)
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await deleteCity(id);
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
        <h1 className="text-2xl font-bold">Cidades</h1>
        <Link to="/cities/new" className="bg-blue-500 text-white p-2 rounded">
          Novo País
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Id do Estado</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.id} className="border-t">
              <td className="p-2">{city.id}</td>
              <td className="p-2">{city.name}</td>
              <td className="p-2">{city.state_id}</td>
              <td className="p-2">
                <Link
                  to={`/cities/${city.id}/edit`}
                  className="text-blue-500 mr-2"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(city.id)}
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

export default CitiesList;
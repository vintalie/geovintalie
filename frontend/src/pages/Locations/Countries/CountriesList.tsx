import { Link } from 'react-router-dom';
import { deleteCountry, getCountries } from '../../../api/location';
import PaginationControls from '../../../components/common/PaginationControls';
import { usePaginatedResource } from '../../../hooks/usePaginatedResource';
import type { Country } from '../../../types';

const CountriesList = () => {
  // Hook de paginação – definimos o extrator para pegar response.data.countries
  const {
    data: countries,
    meta,
    links,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    reload,
  } = usePaginatedResource<Country>(
    (page, perPage) => getCountries({ page, per_page: perPage }),
    (response) => {
    return response.data.countries;

    }, // extrator da parte paginada
    { perPage: 10 }
  );
  console.log(countries)
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await deleteCountry(id);
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
        <h1 className="text-2xl font-bold">Países</h1>
        <Link to="/countries/new" className="bg-blue-500 text-white p-2 rounded">
          Novo País
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country) => (
            <tr key={country.id} className="border-t">
              <td className="p-2">{country.id}</td>
              <td className="p-2">{country.name}</td>
              <td className="p-2">{country.code}</td>
              <td className="p-2">
                <Link
                  to={`/countries/${country.id}/edit`}
                  className="text-blue-500 mr-2"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(country.id)}
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

export default CountriesList;
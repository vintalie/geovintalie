import React, { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { deleteState, getState, getStates } from '../../../api/location';
import PaginationControls from '../../../components/common/PaginationControls';
import { usePaginatedResource } from '../../../hooks/usePaginatedResource';
import type { State } from '../../../types';

const StatesList = () => {
  const { id } = useParams<{ id: string }>();
  const countryId = id ? Number(id) : null;

  // Estado para a visualização individual
  const [singleState, setSingleState] = React.useState<State | null>(null);
  const [loadingSingle, setLoadingSingle] = React.useState(false);
  const [singleError, setSingleError] = React.useState('');

  // Função de busca estável (memoizada)
  const fetchStates = useCallback(
    (page: number, perPage: number) => getStates({ page, per_page: perPage }),
    []
  );

  // Extrator estável (pode ser definido fora do componente também)
  const extractStates = useCallback(
    (response: any) => response.data, // ajuste conforme sua API
    []
  );

  // Hook de paginação – desabilitado quando há um id
  const {
    data: states,
    meta,
    links,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    reload,
  } = usePaginatedResource<State>(
    fetchStates,
    extractStates,
    { perPage: 10, enabled: !id } // <-- desliga quando id existe
  );

  // Carregar um único estado se id estiver presente
  React.useEffect(() => {
    if (id) {
      setLoadingSingle(true);
      getState(Number(id))
        .then((response) => {
          // Ajuste conforme a estrutura: pode ser response.data.data ou response.data.state
          setSingleState(response.data);
          setSingleError('');
        })
        .catch((err) => setSingleError(err.message))
        .finally(() => setLoadingSingle(false));
    }
  }, [id]);

  const handleDelete = async (stateId: number) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await deleteState(countryId ?? 0, stateId);
      if (id) {
        setSingleState(null);
      } else {
        reload(); // recarrega a lista atual
      }
    } catch (err: any) {
      alert('Erro ao deletar');
    }
  };

  // --- Visualização individual ---
  if (id) {
    if (loadingSingle) return <div>Carregando estado...</div>;
    if (singleError) return <div className="text-red-500">{singleError}</div>;
    if (!singleState) return <div>Estado não encontrado</div>;

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Estado: {singleState.name}</h1>
          <Link to="/states" className="bg-gray-500 text-white p-2 rounded">
            Voltar para lista
          </Link>
        </div>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">Sigla</th>
              <th className="p-2 text-left">País</th>
              <th className="p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-2">{singleState.id}</td>
              <td className="p-2">{singleState.name}</td>
              <td className="p-2">{singleState.abbreviation}</td>
              <td className="p-2">{singleState.country_name}</td>
              <td className="p-2">
                <Link to={`/states/${singleState.id}/edit`} className="text-blue-500 mr-2">
                  Editar
                </Link>
                <button onClick={() => handleDelete(singleState.id)} className="text-red-500">
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // --- Lista paginada (quando não há id) ---
  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Estados</h1>
        <Link to="/states/new" className="bg-blue-500 text-white p-2 rounded">
          Novo Estado
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Sigla</th>
            <th className="p-2 text-left">País</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {states.map((state) => (
            <tr key={state.id} className="border-t">
              <td className="p-2">{state.id}</td>
              <td className="p-2">{state.name}</td>
              <td className="p-2">{state.abbreviation}</td>
              <td className="p-2">{state.country_name}</td>
              <td className="p-2">
                <Link to={`/states/${state.id}/edit`} className="text-blue-500 mr-2">
                  Editar
                </Link>
                <button onClick={() => handleDelete(state.id)} className="text-red-500">
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

export default StatesList;
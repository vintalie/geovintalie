import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getStocks, getStoc, deleteStock } from '../../api/location';
import type { Stock } from '../../types';

const PropertyList = () => {
  const [propertys, setPropertys] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countryId, setCountryId] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // Para simplificar, vamos listar estados de um país fixo (ex: Brasil com id 1)
    // Em uma aplicação real, você poderia selecionar o país.
    // Aqui vamos usar o país com id 1 ou pedir para escolher.
    const defaultCountry = 1;
    setCountryId(defaultCountry);
    loadStates();


    
  }, []);

  const loadStates = async () => {
    
    try {
      if(id) {
        const response = await getProperty(Number(id));
        setPropertys(response.data.propertys.data);

      }else{
        const response = await getProperties();
        setPropertys(response.data.propertys.data);

      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await deleteProperty(countryId!);
      setPropertys(propertys.filter(s => s.id !== id));
    } catch (err: any) {
      alert('Erro ao deletar');
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Propriedades</h1>
        <Link to="/property/new" className="bg-blue-500 text-black p-2 rounded">Novo Estado</Link>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">N da Propriedade</th>
            <th className="p-2 text-left">Complemento</th>
            <th className="p-2 text-left">Foto Principal</th>
            <th className="p-2 text-left">Foto de Capa</th>
            <th className="p-2 text-left">Conteudo HTML</th>
            <th className="p-2 text-left">Informações adicionais</th>
            <th className="p-2 text-left">Email 1</th>
            <th className="p-2 text-left">Email 2</th>
            <th className="p-2 text-left">Numero 1</th>
            <th className="p-2 text-left">Numero 2</th>
            <th className="p-2 text-left">Numero 3</th>
          </tr>
        </thead>
        <tbody>
          {propertys.map(property => (
            <tr key={property.id} className="border-t">
              <td className="p-2">{property.id}</td>
              <td className="p-2">{property.name}</td>
              <td className="p-2">{property.n_property}</td>
              <td className="p-2">{property.complement}</td>
              <td className="p-2">{property.main_image}</td>
              <td className="p-2">{property.cover_image}</td>
              <td className="p-2">{property.content_html}</td>
              <td className="p-2">{property.additional_info}</td>
              <td className="p-2">{property.contact1_email}</td>
              <td className="p-2">{property.contact2_email}</td>
              <td className="p-2">{property.number1}</td>
              <td className="p-2">{property.number1}</td>
              <td className="p-2">{property.number1}</td>
              <td className="p-2">
                <Link to={`/property/${property.id}/edit`} className="text-blue-500 mr-2">Editar</Link>
                <button onClick={() => handleDelete(property.id)} className="text-red-500">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyList;

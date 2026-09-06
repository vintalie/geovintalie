import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCity, createCity, updateCity } from '../../../api/location';
import type { City } from '../../../types';

const CityFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<City>>({ name: '', state_id: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!id;
  const countryId = 1; // fixo

  useEffect(() => {
    if (isEdit) {
      loadCity();
    }
  }, [id]);

  const loadCity = async () => {
    try {
      const response = await getCity(countryId, 1, Number(id));
      setForm(response.data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const stateId = form.state_id || 1;
      if (isEdit) {
        await updateCity(countryId, stateId, Number(id), form);
      } else {
        await createCity(countryId, form);
      }
      navigate('/cities');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Editar Cidade' : 'Nova Cidade'}</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-2">
          <label className="block">Nome</label>
          <input
            type="text"
            name="name"
            value={form.name || ''}
            onChange={handleChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block">ID do Estado (ex: 1)</label>
          <input
            type="number"
            name="state_id"
            value={form.state_id || ''}
            onChange={handleChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
};

export default CityFormPage;

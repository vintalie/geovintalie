import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getState, createState, updateState } from '../../../api/location';
import type { State } from '../../../types';

const StateFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<State>>({ name: '', country_id: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadState();
    }
  }, [id]);

  const loadState = async () => {
    try {
      // Usando country_id fixo 1 para simplicidade
      const response = await getState(1, Number(id));
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
      const countryId = form.country_id || 1;
      console.log(form)
      if (isEdit) {
        await updateState(countryId, Number(id), form);
      } else {
        await createState(countryId, form);
      }
      navigate('/states');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Editar Estado' : 'Novo Estado'}</h1>
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
          <label className="block">ID do País (ex: 1)</label>
          <input
            type="number"
            name="country_id"
            value={form.country_id || ''}
            onChange={handleChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Sigla</label>
          <input
            type="text"
            name="abbreviation"
            value={form.abbreviation || ''}
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

export default StateFormPage;

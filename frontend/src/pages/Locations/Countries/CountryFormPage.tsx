import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCountry, createCountry, updateCountry } from '../../../api/location';
import type { Country } from '../../../types';

const CountryFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<Country>>({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadCountry();
    }
  }, [id]);

  const loadCountry = async () => {
    try {
      const response = await getCountry(Number(id));
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
      if (isEdit) {
        await updateCountry(Number(id), form);
      } else {
        await createCountry(form);
      }
      navigate('/countries');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Editar País' : 'Novo País'}</h1>
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

        <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
};

export default CountryFormPage;

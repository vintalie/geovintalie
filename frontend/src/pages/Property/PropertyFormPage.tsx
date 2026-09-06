import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, createProperty, updateProperty } from '../../api/location';
import type { Property } from '../../types';

const PropertyFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Apenas os campos obrigatórios no estado inicial (os opcionais ficam undefined)
  const [form, setForm] = useState<Partial<Property>>({
    name: '',
    n_property: '',
    contact1_email: '',
    number1: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await getProperty(Number(id));
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
        await updateProperty(Number(id), form);
      } else {
        await createProperty(form);
      }
      navigate('/properties');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? 'Editar Propriedade' : 'Nova Propriedade'}
      </h1>
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
        <div className="mb-2">
          <label className="block">Nº Propriedade</label>
          <input
            type="text"
            name="n_property"
            value={form.n_property || ''}
            onChange={handleChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Complemento</label>
          <input
            type="text"
            name="complement"
            value={form.complement || ''}
            onChange={handleChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-2">
          <label className="block">Imagem Principal (URL)</label>
          <input
            type="text"
            name="main_image"
            value={form.main_image || ''}
            onChange={handleChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-2">
          <label className="block">Imagem de Capa (URL)</label>
          <input
            type="text"
            name="cover_image"
            value={form.cover_image || ''}
            onChange={handleChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-2">
          <label className="block">Conteúdo HTML</label>
          <input
            type="text"
            name="content_html"
            value={form.content_html || ''}
            onChange={handleChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-2">
          <label className="block">Informações Adicionais</label>
          <input
            type="text"
            name="additional_info"
            value={form.additional_info || ''}
            onChange={handleChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-2">
          <label className="block">Email 1</label>
          <input
            type="email"
            name="contact1_email"
            value={form.contact1_email || ''}
            onChange={handleChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Email 2</label>
          <input
            type="email"
            name="contact2_email"
            value={form.contact2_email || ''}
            onChange={handleChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-2">
          <label className="block">Número 1</label>
          <input
            type="text"
            name="number1"
            value={form.number1 || ''}
            onChange={handleChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Número 2</label>
          <input
            type="text"
            name="number2"
            value={form.number2 || ''}
            onChange={handleChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-2">
          <label className="block">Número 3</label>
          <input
            type="text"
            name="number3"
            value={form.number3 || ''}
            onChange={handleChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-4">
          <label className="block">ID da Rua</label>
          <input
            type="number"
            name="street_id"
            value={form.street_id || ''}
            onChange={handleChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
};

export default PropertyFormPage;
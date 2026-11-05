import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, createProperty, updateProperty } from '../../api/location';
import type { Property } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PropertyFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<Property>>({
    name: '',
    n_property: '',
    complement: '',
    main_image: '',
    cover_image: '',
    content_html: '',
    additional_info: '',
    contact1_email: '',
    contact2_email: '',
    number1: '',
    number2: '',
    number3: '',
    street_id: 0,
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
      const data = response.data.property ?? response.data.propertys ?? response.data.properties ?? response.data;
      setForm(data);
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
      setError(err.response?.data?.message || 'Erro ao salvar propriedade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {isEdit ? 'Editar Propriedade' : 'Nova Propriedade'}
          </CardTitle>
          <CardDescription>
            {isEdit ? 'Atualize os dados da propriedade.' : 'Cadastre uma nova propriedade no sistema.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Nome da propriedade</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ex: Farmácia Central"
                  value={form.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="n_property">Número da propriedade</Label>
                <Input
                  id="n_property"
                  name="n_property"
                  type="text"
                  placeholder="Ex: 101"
                  value={form.n_property || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                name="complement"
                type="text"
                placeholder="Ex: Apto 101"
                value={form.complement || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="main_image">Imagem principal (URL)</Label>
                <Input
                  id="main_image"
                  name="main_image"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={form.main_image || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="cover_image">Imagem de capa (URL)</Label>
                <Input
                  id="cover_image"
                  name="cover_image"
                  type="url"
                  placeholder="https://exemplo.com/capa.jpg"
                  value={form.cover_image || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="content_html">Conteúdo HTML</Label>
              <Input
                id="content_html"
                name="content_html"
                type="text"
                placeholder="Descrição em HTML"
                value={form.content_html || ''}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="additional_info">Informações adicionais</Label>
              <Input
                id="additional_info"
                name="additional_info"
                type="text"
                placeholder="Informações complementares"
                value={form.additional_info || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="contact1_email">E-mail principal</Label>
                <Input
                  id="contact1_email"
                  name="contact1_email"
                  type="email"
                  placeholder="loja@exemplo.com"
                  value={form.contact1_email || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="contact2_email">E-mail secundário</Label>
                <Input
                  id="contact2_email"
                  name="contact2_email"
                  type="email"
                  placeholder="contato@exemplo.com"
                  value={form.contact2_email || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="number1">Telefone 1</Label>
                <Input
                  id="number1"
                  name="number1"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.number1 || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="number2">Telefone 2</Label>
                <Input
                  id="number2"
                  name="number2"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.number2 || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="number3">Telefone 3</Label>
                <Input
                  id="number3"
                  name="number3"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.number3 || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="street_id">ID da Rua</Label>
              <Input
                id="street_id"
                name="street_id"
                type="number"
                placeholder="ID da rua cadastrada"
                value={form.street_id || ''}
                onChange={handleChange}
                required
              />
            </div>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Salvando...' : 'Salvar Propriedade'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default PropertyFormPage;

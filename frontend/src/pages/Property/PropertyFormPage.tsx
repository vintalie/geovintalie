import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCountries,
  getStates,
  getCities,
  getNeighborhoods,
  getStreets,
  createCountry,
  createState,
  createCity,
  createNeighborhood,
  createStreet,
  createProperty,
  updateProperty,
  getProperty,
} from '../../api/location';
import type { Property } from '../../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner, PageSpinner } from '@/components/ui/spinner';
import { Plus, MapPin } from 'lucide-react';

interface LocationOption {
  id: number;
  name: string;
  parent_id?: number | null;
}

const LocationFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<Property> & {
    country_id?: number | null;
    state_id?: number | null;
    city_id?: number | null;
    neighborhood_id?: number | null;
    street_id?: number | null;
  }>({
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
    country_id: null,
    state_id: null,
    city_id: null,
    neighborhood_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState<{
    countries: LocationOption[];
    states: LocationOption[];
    cities: LocationOption[];
    neighborhoods: LocationOption[];
    streets: LocationOption[];
  }>({
    countries: [],
    states: [],
    cities: [],
    neighborhoods: [],
    streets: [],
  });
  const [locationsLoading, setLocationsLoading] = useState(false);

  const isEdit = !!id;

  // Opções disponíveis em cada nível, filtradas pelo contexto (país → estado → cidade → bairro → rua).
  const availableStates = useMemo(
    () =>
      form.country_id == null
        ? []
        : locations.states.filter((s) => s.parent_id === form.country_id),
    [locations.states, form.country_id],
  );
  const availableCities = useMemo(
    () =>
      form.state_id == null
        ? []
        : locations.cities.filter((c) => c.parent_id === form.state_id),
    [locations.cities, form.state_id],
  );
  const availableNeighborhoods = useMemo(
    () =>
      form.city_id == null
        ? []
        : locations.neighborhoods.filter((n) => n.parent_id === form.city_id),
    [locations.neighborhoods, form.city_id],
  );
  const availableStreets = useMemo(
    () =>
      form.neighborhood_id == null
        ? []
        : locations.streets.filter((s) => s.parent_id === form.neighborhood_id),
    [locations.streets, form.neighborhood_id],
  );

  useEffect(() => {
    if (isEdit) {
      loadProperty();
    }
    loadLocations();
  }, [isEdit]);

  // Pré-seleciona Brasil ao abrir o formulário (cadastro novo).
  useEffect(() => {
    if (isEdit || form.country_id || locations.countries.length === 0) return;
    const brazil = locations.countries.find(
      (c) =>
        c.name.toLowerCase() === 'brasil' ||
        c.name.toLowerCase().includes('brasil') ||
        c.name.toLowerCase() === 'brazil' ||
        (c as any).code === 'BR',
    );
    if (brazil) {
      setForm((prev) => ({ ...prev, country_id: brazil.id }));
    }
  }, [locations.countries, isEdit, form.country_id]);

  const loadLocations = useCallback(async () => {
    setLocationsLoading(true);
    try {
      const [cResp, sResp, ciResp, nResp, stResp] = await Promise.all([
        getCountries({ page: 1, per_page: 100 }),
        getStates({ page: 1, per_page: 100 }),
        getCities({ page: 1, per_page: 100 }),
        getNeighborhoods({ page: 1, per_page: 100 }),
        getStreets({ page: 1, per_page: 100 }),
      ]);

      const extractData = (resp: any) => {
        if (resp.data?.countries) return resp.data.countries.data;
        if (resp.data?.data) return resp.data.data;
        return resp.data || [];
      };

      const toOption = (item: any, parentKey?: string) => ({
        id: item.id,
        name: item.name,
        ...(parentKey && item[parentKey] != null
          ? { parent_id: item[parentKey] }
          : {}),
      });

      setLocations({
        countries: extractData(cResp).map((c: any) => toOption(c)),
        states: extractData(sResp).map((s: any) => toOption(s, 'country_id')),
        cities: extractData(ciResp).map((c: any) => toOption(c, 'state_id')),
        neighborhoods: extractData(nResp).map((n: any) =>
          toOption(n, 'city_id'),
        ),
        streets: extractData(stResp).map((s: any) => ({
          id: s.id,
          name: s.name,
          parent_id: s.neighborhood_id != null ? s.neighborhood_id : s.city_id ?? null,
        })),
      });
    } catch (err) {
      setError('Erro ao carregar localizações.');
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  const loadProperty = async () => {
    try {
      const response = await getProperty(Number(id));
      const data =
        response.data.property ??
        response.data.propertys ??
        response.data.properties ??
        response.data;
      setForm({
        ...data,
        country_id: data.country_id ?? null,
        state_id: data.state_id ?? null,
        city_id: data.city_id ?? null,
        neighborhood_id: data.neighborhood_id ?? null,
        street_id: data.street_id ?? 0,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (field: string, id: number | null) => {
    setForm((prev) => ({ ...prev, [field]: id }));
    if (field === 'country_id') {
      setForm((prev) => ({
        ...prev,
        state_id: null,
        city_id: null,
        neighborhood_id: null,
        street_id: 0,
      }));
    } else if (field === 'state_id') {
      setForm((prev) => ({
        ...prev,
        city_id: null,
        neighborhood_id: null,
        street_id: 0,
      }));
    } else if (field === 'city_id') {
      setForm((prev) => ({
        ...prev,
        neighborhood_id: null,
        street_id: 0,
      }));
    } else if (field === 'neighborhood_id') {
      setForm((prev) => ({ ...prev, street_id: 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form };
      // Os ids de país/estado/cidade/bairro ficam no formulário apenas como
      // contexto de cascata; o vínculo salvo na propriedade é o da rua selecionada,
      // que carrega a cadeia completa (bairro → cidade → estado → país).
      delete payload.country_id;
      delete payload.state_id;
      delete payload.city_id;
      delete payload.neighborhood_id;

      if (isEdit) {
        await updateProperty(Number(id), payload);
      } else {
        await createProperty(payload);
      }
      navigate('/properties');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar propriedade.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div className="fade-in" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <Card className="shadow-card border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                {isEdit ? 'Editar Propriedade' : 'Nova Propriedade'}
              </CardTitle>
              <CardDescription>
                {isEdit
                  ? 'Atualize os dados da propriedade.'
                  : 'Cadastre uma nova propriedade no sistema.'}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/properties">
                <MapPin className="h-4 w-4 mr-2" /> Voltar
              </a>
            </Button>
          </CardHeader>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
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

              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Localização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <LocationField
                    label="País"
                    value={form.country_id ?? null}
                    onChange={(id) => handleLocationChange('country_id', id)}
                    options={locations.countries}
                    isLoading={locationsLoading}
                    onCreate={(name) => createCountryAndSelect(name)}
                    placeholder="Buscar país..."
                  />
                  <LocationField
                    label="Estado"
                    value={form.state_id ?? null}
                    onChange={(id) => handleLocationChange('state_id', id)}
                    options={availableStates}
                    isLoading={locationsLoading}
                    disabled={!form.country_id}
                    placeholder="Selecione o país primeiro..."
                    onCreate={(name) => createStateAndSelect(name)}
                  />
                  <LocationField
                    label="Cidade"
                    value={form.city_id ?? null}
                    onChange={(id) => handleLocationChange('city_id', id)}
                    options={availableCities}
                    isLoading={locationsLoading}
                    disabled={!form.state_id}
                    placeholder="Selecione o estado primeiro..."
                    onCreate={(name) => createCityAndSelect(name)}
                  />
                  <LocationField
                    label="Bairro"
                    value={form.neighborhood_id ?? null}
                    onChange={(id) =>
                      handleLocationChange('neighborhood_id', id)
                    }
                    options={availableNeighborhoods}
                    isLoading={locationsLoading}
                    disabled={!form.city_id}
                    placeholder="Selecione a cidade primeiro..."
                    onCreate={(name) => createNeighborhoodAndSelect(name)}
                  />
                  <LocationField
                    label="Rua"
                    value={form.street_id || null}
                    onChange={(id) => handleLocationChange('street_id', id)}
                    options={availableStreets}
                    isLoading={locationsLoading}
                    disabled={!form.neighborhood_id}
                    placeholder="Selecione o bairro primeiro..."
                    onCreate={(name) => createStreetAndSelect(name)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
                  <Label htmlFor="additional_info">
                    Informações adicionais
                  </Label>
                  <Input
                    id="additional_info"
                    name="additional_info"
                    type="text"
                    placeholder="Informações complementares"
                    value={form.additional_info || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
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

              <div className="flex flex-col gap-2">
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

              <CardFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Salvando...' : 'Salvar Propriedade'}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );

  function LocationField({
    label,
    value,
    onChange,
    options,
    isLoading,
    onCreate,
    disabled,
    placeholder,
  }: {
    label: string;
    value: number | null;
    onChange: (id: number | null) => void;
    options: LocationOption[];
    isLoading?: boolean;
    onCreate?: (name: string) => void;
    disabled?: boolean;
    placeholder?: string;
  }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerm === '',
    );

    const selectedOption = options.find((opt) => opt.id === value);

    const handleCreate = () => {
      if (!searchTerm.trim() || !onCreate) return;
      onCreate(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    };

    return (
      <div className="flex flex-col gap-1">
        <Label htmlFor={`loc-${label.toLowerCase()}`}>{label}</Label>
        <div className="relative">
          <input
            id={`loc-${label.toLowerCase()}`}
            type="text"
            placeholder={placeholder || `Buscar ${label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled || isLoading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {selectedOption && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {selectedOption.name}
            </span>
          )}
          {isLoading && (
            <Spinner size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" />
          )}
          {isOpen && !isLoading && (
            <div className="w-full max-h-60 overflow-y-auto border border-input rounded-md shadow-md z-50 bg-background">
              {searchTerm.trim() && !filteredOptions.some((o) => o.id === value) && (
                <div
                  onClick={() => handleCreate()}
                  className="cursor-pointer text-sm text-primary p-2 hover:bg-accent/50"
                >
                  <Plus className="mr-2 h-3 w-3 inline" />
                  Criar "{searchTerm}" como novo {label.toLowerCase()}
                </div>
              )}
              <div className="-mx-1 my-1 h-px bg-muted" />
              {filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onMouseDown={(e) => {
                    // Impede que o clique na opção tire o foco do input e feche
                    // o dropdown antes da seleção ser confirmada.
                    e.preventDefault();
                  }}
                  onClick={() => {
                    onChange(opt.id);
                    setSearchTerm(opt.name);
                    setIsOpen(false);
                  }}
                  className="cursor-pointer text-sm p-2 hover:bg-accent/50"
                >
                  {opt.name}
                </div>
              ))}
              {filteredOptions.length === 0 && searchTerm.trim() && (
                <div className="text-sm text-muted-foreground p-2">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          )}
        </div>
        {value && !selectedOption && (
          <p className="text-xs text-destructive">
            {label} não encontrado no banco. Será marcado como não visível até um administrador ativá-lo.
          </p>
        )}
      </div>
    );
  }

  async function createCountryAndSelect(name: string) {
    try {
      const resp = await createCountry({ name });
      const newId = resp.data?.country?.id || resp.data?.id;
      if (newId) {
        setLocations((prev) => ({
          ...prev,
          countries: [...prev.countries, { id: newId, name }],
        }));
        handleLocationChange('country_id', newId);
      }
    } catch (err) {
      setError('Erro ao criar país.');
    }
  }

  async function createStateAndSelect(name: string) {
    try {
      const resp = await createState({ name, country_id: form.country_id || 0 });
      const newId = resp.data?.state?.id || resp.data?.id;
      if (newId) {
        setLocations((prev) => ({
          ...prev,
          states: [...prev.states, { id: newId, name, parent_id: form.country_id }],
        }));
        handleLocationChange('state_id', newId);
      }
    } catch (err) {
      setError('Erro ao criar estado.');
    }
  }

  async function createCityAndSelect(name: string) {
    try {
      const resp = await createCity({ name, state_id: form.state_id || 0 });
      const newId = resp.data?.city?.id || resp.data?.id;
      if (newId) {
        setLocations((prev) => ({
          ...prev,
          cities: [...prev.cities, { id: newId, name, parent_id: form.state_id }],
        }));
        handleLocationChange('city_id', newId);
      }
    } catch (err) {
      setError('Erro ao criar cidade.');
    }
  }

  async function createNeighborhoodAndSelect(name: string) {
    try {
      const resp = await createNeighborhood({
        name,
        city_id: form.city_id || 0,
      });
      const newId = resp.data?.neighborhood?.id || resp.data?.id;
      if (newId) {
        setLocations((prev) => ({
          ...prev,
          neighborhoods: [
            ...prev.neighborhoods,
            { id: newId, name, parent_id: form.city_id },
          ],
        }));
        handleLocationChange('neighborhood_id', newId);
      }
    } catch (err) {
      setError('Erro ao criar bairro.');
    }
  }

  async function createStreetAndSelect(name: string) {
    try {
      const resp = await createStreet({
        name,
        neighborhood_id: form.neighborhood_id || 0,
      });
      const newId = resp.data?.street?.id || resp.data?.id;
      if (newId) {
        setLocations((prev) => ({
          ...prev,
          streets: [
            ...prev.streets,
            { id: newId, name, parent_id: form.neighborhood_id },
          ],
        }));
        handleLocationChange('street_id', newId);
      }
    } catch (err) {
      setError('Erro ao criar rua.');
    }
  }
};

export default LocationFormPage;

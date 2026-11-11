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

interface FieldError {
  message: string;
  anchor?: string;
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
  const [error, setError] = useState<FieldError | null>(null);
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
  const [openField, setOpenField] = useState<string | null>(null);

  const isEdit = !!id;

  // Cascata real: cada nível filtra pelo pai selecionado.
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

  // Pré-seleciona Brasil ao abrir o formulário de cadastro novo.
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
    setError(null);
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
        console.log(resp.data)
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
      setError({
        message: 'Não foi possível carregar países, estados e cidades. Tente novamente em instantes.',
        anchor: 'country',
      });
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  const loadProperty = async () => {
    setError(null);
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
      setError({
        message: 'Não foi possível carregar os dados da propriedade. Verifique se ela ainda existe.',
        anchor: 'name',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpa erro de campo quando o usuário começa a digitar
    if (error?.anchor === e.target.name) {
      setError(null);
    }
  };

  const handleLocationChange = (field: string, id: number | null) => {
    setForm((prev) => ({ ...prev, [field]: id }));
    setOpenField(null);
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
    setError(null);
    setLoading(true);

    // Validação básica com mensagens acionáveis
    if (!form.name?.trim()) {
      setError({ message: 'Informe o nome da propriedade.', anchor: 'name' });
      setLoading(false);
      return;
    }
    if (!form.number1?.trim()) {
      setError({ message: 'Informe pelo menos um telefone de contato.', anchor: 'number1' });
      setLoading(false);
      return;
    }
    if (!form.contact1_email?.trim()) {
      setError({ message: 'Informe o e-mail principal da loja.', anchor: 'contact1_email' });
      setLoading(false);
      return;
    }
    if (!form.street_id) {
      setError({ message: 'Selecione a rua da propriedade.', anchor: 'street' });
      setLoading(false);
      return;
    }

    try {
      const payload: any = { ...form };
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
      setError({
        message:
          err.response?.data?.message ||
          'Não foi possível salvar a propriedade. Verifique os dados e tente novamente.',
        anchor: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-8 font-sans">
      <div className="fade-in" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <Card className="border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-display font-bold tracking-tight">
                {isEdit ? 'Editar propriedade' : 'Nova propriedade'}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {isEdit
                  ? 'Atualize os dados da propriedade.'
                  : 'Preencha os dados para cadastrar uma nova propriedade.'}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="focus-visible:ring-2 focus-visible:ring-ring">
              <a href="/properties">
                <MapPin className="h-4 w-4 mr-2" /> Voltar à lista
              </a>
            </Button>
          </CardHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
              {/* Dados principais */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="font-medium">
                    Nome da propriedade <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Ex: Farmácia Central"
                    value={form.name || ''}
                    onChange={handleChange}
                    required
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="n_property" className="font-medium">
                    Número da propriedade <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Input
                    id="n_property"
                    name="n_property"
                    type="text"
                    placeholder="Ex: 101"
                    value={form.n_property || ''}
                    onChange={handleChange}
                    required
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </section>

              {/* Localização */}
              <section className="border rounded-lg p-6 bg-muted/50 space-y-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Localização
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <LocationField
                    label="País"
                    value={form.country_id ?? null}
                    onChange={(id) => handleLocationChange('country_id', id)}
                    options={locations.countries}
                    isLoading={locationsLoading}
                    onCreate={(name) => createCountryAndSelect(name)}
                    placeholder="Buscar país…"
                    open={openField === 'country'}
                    onOpenChange={(open) =>
                      setOpenField(open ? 'country' : null)
                    }
                  />
                  <LocationField
                    label="Estado"
                    value={form.state_id ?? null}
                    onChange={(id) => handleLocationChange('state_id', id)}
                    options={availableStates}
                    isLoading={locationsLoading}
                    disabled={!form.country_id}
                    placeholder="Selecione o país primeiro…"
                    onCreate={(name) => createStateAndSelect(name)}
                    open={openField === 'state'}
                    onOpenChange={(open) => setOpenField(open ? 'state' : null)}
                  />
                  <LocationField
                    label="Cidade"
                    value={form.city_id ?? null}
                    onChange={(id) => handleLocationChange('city_id', id)}
                    options={availableCities}
                    isLoading={locationsLoading}
                    disabled={!form.state_id}
                    placeholder="Selecione o estado primeiro…"
                    onCreate={(name) => createCityAndSelect(name)}
                    open={openField === 'city'}
                    onOpenChange={(open) => setOpenField(open ? 'city' : null)}
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
                    placeholder="Selecione a cidade primeiro…"
                    onCreate={(name) => createNeighborhoodAndSelect(name)}
                    open={openField === 'neighborhood'}
                    onOpenChange={(open) =>
                      setOpenField(open ? 'neighborhood' : null)
                    }
                  />
                  <LocationField
                    label="Rua"
                    value={form.street_id || null}
                    onChange={(id) => handleLocationChange('street_id', id)}
                    options={availableStreets}
                    isLoading={locationsLoading}
                    disabled={!form.neighborhood_id}
                    placeholder="Selecione o bairro primeiro…"
                    onCreate={(name) => createStreetAndSelect(name)}
                    open={openField === 'street'}
                    onOpenChange={(open) => setOpenField(open ? 'street' : null)}
                  />
                </div>
              </section>

              {/* Contato */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    name="complement"
                    type="text"
                    placeholder="Ex: Apto 101"
                    value={form.complement || ''}
                    onChange={handleChange}
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact1_email" className="font-medium">
                    E-mail principal <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Input
                    id="contact1_email"
                    name="contact1_email"
                    type="email"
                    placeholder="loja@exemplo.com"
                    value={form.contact1_email || ''}
                    onChange={handleChange}
                    required
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact2_email">E-mail secundário</Label>
                  <Input
                    id="contact2_email"
                    name="contact2_email"
                    type="email"
                    placeholder="contato@exemplo.com"
                    value={form.contact2_email || ''}
                    onChange={handleChange}
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="additional_info">Informações adicionais</Label>
                  <Input
                    id="additional_info"
                    name="additional_info"
                    type="text"
                    placeholder="Informações complementares"
                    value={form.additional_info || ''}
                    onChange={handleChange}
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </section>

              {/* Telefones */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="number1" className="font-medium">
                    Telefone principal <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Input
                    id="number1"
                    name="number1"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={form.number1 || ''}
                    onChange={handleChange}
                    required
                    className="focus-visible:ring-2 focus-visible:ring-ring"
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
                    className="focus-visible:ring-2 focus-visible:ring-ring"
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
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </section>

              {/* Imagens */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="main_image">Imagem principal (URL)</Label>
                  <Input
                    id="main_image"
                    name="main_image"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={form.main_image || ''}
                    onChange={handleChange}
                    className="focus-visible:ring-2 focus-visible:ring-ring"
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
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </section>

              {/* Conteúdo */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="content_html">Conteúdo (HTML)</Label>
                <Input
                  id="content_html"
                  name="content_html"
                  type="text"
                  placeholder="Descrição em HTML"
                  value={form.content_html || ''}
                  onChange={handleChange}
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <CardFooter className="pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {loading ? 'Salvando…' : 'Salvar propriedade'}
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
    open,
    onOpenChange,
  }: {
    label: string;
    value: number | null;
    onChange: (id: number | null) => void;
    options: LocationOption[];
    isLoading?: boolean;
    onCreate?: (name: string) => void;
    disabled?: boolean;
    placeholder?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerm === '',
    );

    const selectedOption = options.find((opt) => opt.id === value);
    const isOpen = open ?? false;

    const handleCreate = () => {
      if (!searchTerm.trim() || !onCreate) return;
      onCreate(searchTerm.trim());
      setSearchTerm('');
    };

    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={`loc-${label.toLowerCase()}`}>{label}</Label>
        <div className="relative">
          <input
            id={`loc-${label.toLowerCase()}`}
            type="text"
            placeholder={placeholder || `Buscar ${label.toLowerCase()}…`}
            value={isOpen ? searchTerm : selectedOption?.name || ''}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onOpenChange?.(true);
            }}
            onFocus={() => onOpenChange?.(true)}
            onBlur={() => {
              // Fecha só depois de dar tempo para o clique na opção registrar
              setTimeout(() => onOpenChange?.(false), 200);
            }}
            disabled={disabled || isLoading}
            className="
              flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
              disabled:cursor-not-allowed disabled:opacity-50
            "
          />
          {selectedOption && !isOpen && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {selectedOption.name}
            </span>
          )}
          {isLoading && (
            <Spinner size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" />
          )}
          {isOpen && !isLoading && (
            <div className="w-full max-h-60 overflow-y-auto border border-input rounded-md shadow-lg z-50 bg-background mt-1 animate-in fade-in slide-in-from-top-2 duration-100 ease-out">
              {searchTerm.trim() &&
                !filteredOptions.some((o) => o.id === value) && (
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleCreate}
                    className="cursor-pointer text-sm text-primary p-2 hover:bg-accent/50"
                  >
                    <Plus className="mr-2 h-3 w-3 inline" />
                    Criar “{searchTerm}” como novo {label.toLowerCase()}
                  </div>
                )}
              <div className="-mx-1 my-1 h-px bg-muted" />
              {filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // mantém o foco no input para o onClick disparar
                  }}
                  onClick={() => {
                    onChange(opt.id);
                    setSearchTerm(opt.name);
                    onOpenChange?.(false);
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
      setError({ message: 'Não foi possível criar o país. Tente novamente.', anchor: 'country' });
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
      setError({ message: 'Não foi possível criar o estado. Tente novamente.', anchor: 'state' });
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
      setError({ message: 'Não foi possível criar a cidade. Tente novamente.', anchor: 'city' });
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
      setError({ message: 'Não foi possível criar o bairro. Tente novamente.', anchor: 'neighborhood' });
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
      setError({ message: 'Não foi possível criar a rua. Tente novamente.', anchor: 'street' });
    }
  }
};

export default LocationFormPage;

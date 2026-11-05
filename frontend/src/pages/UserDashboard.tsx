import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Store, Boxes, ShoppingCart, LogOut,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isUser = user?.tipo_nome === 'user';

  useEffect(() => {
    if (user !== null && !isUser) {
      navigate('/admin');
    }
  }, [user, isUser, navigate]);

  const [properties, setProperties] = useState<any[]>([]);
  const [propProducts, setPropProducts] = useState<any[]>([]);
  const [selectedProp, setSelectedProp] = useState<any | null>(null);
  const [propForm, setPropForm] = useState({ name: '', n_property: '', street: '', neighborhood: '', city: '', state: '', country: '' });
  const [prodForm, setProdForm] = useState({ name: '', tipo: '', price: '', property_id: '' });
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState('success' as 'success' | 'error');
  const [loading, setLoading] = useState(false);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/auth/properties');
      const data = r.data.propertys?.data ?? r.data.properties?.data ?? [];
      const meId = user?.id;
      setProperties(meId ? data.filter((p: any) => p.user_id === meId) : data);
    } catch (e: any) {
      setMessage('Não foi possível carregar as propriedades.'); setMessageKind('error');
    } finally { setLoading(false); }
  };

  const loadPropProducts = async (id: number) => {
    try {
      const r = await api.get(`/api/auth/properties/${id}/products`);
      setPropProducts(r.data.products ?? r.data.propertys?.data ?? []);
      setSelectedProp(properties.find((p: any) => p.id === id) ?? null);
    } catch (e: any) {
      setMessage('Não foi possível carregar os produtos da propriedade.'); setMessageKind('error');
    }
  };

  const handleRegisterProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/properties', {
        name: propForm.name,
        n_property: propForm.n_property,
        street: propForm.street,
        neighborhood: propForm.neighborhood,
        city: propForm.city,
        state: propForm.state,
        country: propForm.country,
      });
      setMessage('Propriedade registrada com sucesso.'); setMessageKind('success');
      setPropForm({ name: '', n_property: '', street: '', neighborhood: '', city: '', state: '', country: '' });
      await loadProperties();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Erro ao registrar propriedade.'); setMessageKind('error');
    } finally { setLoading(false); }
  };

  const handleRegisterProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/products', {
        name: prodForm.name,
        tipo: prodForm.tipo,
        price: Number(prodForm.price),
        property_id: prodForm.property_id,
      });
      setMessage('Produto cadastrado com sucesso.'); setMessageKind('success');
      setProdForm({ name: '', tipo: '', price: '', property_id: '' });
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Erro ao cadastrar produto.'); setMessageKind('error');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <Card className="shadow-card">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent" aria-hidden="true" />
            <h1 className="text-xl font-bold">Painel do Usuário</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Conectado como <b className="font-medium">{user?.name}</b> ({user?.tipo_nome})
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            Cadastrar Propriedade
          </CardTitle>
          <CardDescription>
            Informe o nome e número da propriedade, além do endereço. Se a rua ou bairro ainda não existirem, eles são criados automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <form onSubmit={handleRegisterProperty} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Nome da loja</label>
              <input
                value={propForm.name}
                onChange={(e) => setPropForm({...propForm, name: e.target.value})}
                placeholder="Ex: Farmácia Central"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Nº da propriedade</label>
              <input
                value={propForm.n_property}
                onChange={(e) => setPropForm({...propForm, n_property: e.target.value})}
                placeholder="Ex: 101"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Rua</label>
              <input
                value={propForm.street}
                onChange={(e) => setPropForm({...propForm, street: e.target.value})}
                placeholder="Ex: Avenida São João"
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Bairro</label>
              <input
                value={propForm.neighborhood}
                onChange={(e) => setPropForm({...propForm, neighborhood: e.target.value})}
                placeholder="Ex: Centro"
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Cidade</label>
              <input
                value={propForm.city}
                onChange={(e) => setPropForm({...propForm, city: e.target.value})}
                placeholder="Ex: São Paulo"
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Estado</label>
              <input
                value={propForm.state}
                onChange={(e) => setPropForm({...propForm, state: e.target.value})}
                placeholder="Ex: São Paulo"
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">País</label>
              <input
                value={propForm.country}
                onChange={(e) => setPropForm({...propForm, country: e.target.value})}
                placeholder="Ex: Brasil"
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">&nbsp;</label>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Registrando...' : 'Registrar Propriedade'}
              </Button>
            </div>
          </form>
          {message && (
            <Alert variant={messageKind === 'error' ? 'destructive' : undefined}>
              <AlertTitle>{messageKind === 'success' ? 'Sucesso' : 'Erro'}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" aria-hidden="true" />
            Cadastrar Produto
          </CardTitle>
          <CardDescription>
            Vincule o produto a uma propriedade existente.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <form onSubmit={handleRegisterProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Nome do produto</label>
              <input
                value={prodForm.name}
                onChange={(e) => setProdForm({...prodForm, name: e.target.value})}
                placeholder="Ex: Arroz 5kg"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <input
                value={prodForm.tipo}
                onChange={(e) => setProdForm({...prodForm, tipo: e.target.value})}
                placeholder="Ex: alimento"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={prodForm.price}
                onChange={(e) => setProdForm({...prodForm, price: e.target.value})}
                placeholder="19.90"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Vincular à propriedade</label>
              <Select
                value={prodForm.property_id}
                onValueChange={(v) => setProdForm({...prodForm, property_id: v as string})}
              >
                <SelectTrigger className="w-full input input-bordered">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Selecione</SelectItem>
                  {properties.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.n_property} — {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">&nbsp;</label>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </div>
          </form>
          {message && (
            <Alert variant={messageKind === 'error' ? 'destructive' : undefined}>
              <AlertTitle>{messageKind === 'success' ? 'Sucesso' : 'Erro'}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-4 w-4 text-accent" aria-hidden="true" />
            Minhas Propriedades <Badge variant="secondary">{properties.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-0">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-xs">Carregando…</div>
          ) : properties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs py-10">
              Nenhuma propriedade cadastrada ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((p: any) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 cursor-pointer transition hover:border-accent"
                  onClick={() => loadPropProducts(p.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{p.name}</h4>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">#{p.n_property}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    {p.street_id ? 'Endereço cadastrado' : 'Endereço em cadastro'}
                  </p>
                  <button className="w-full text-xs text-primary hover:text-primary/90 flex items-center gap-1 underline underline-offset-4">
                    Ver produtos <Store size={12} className="inline ml-1" aria-hidden="true"/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProp && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" aria-hidden="true" />
              Produtos de {selectedProp.name}
            </CardTitle>
            <button
              onClick={() => { setSelectedProp(null); setPropProducts([]); }}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Voltar
            </button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Estes são os produtos vinculados à loja selecionada.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {propProducts.length === 0 ? (
                <p className="text-muted-foreground text-center col-span-full text-sm">
                  Esta propriedade ainda não possui produtos cadastrados.
                </p>
              ) : (
                propProducts.map((pr: any) => (
                  <div key={pr.id} className="border rounded-lg p-3">
                    <h4 className="font-semibold">{pr.name}</h4>
                    <p className="text-xs text-muted-foreground">{pr.tipo || '—'}</p>
                    <p className="text-primary font-medium">R$ {Number(pr.price || 0).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

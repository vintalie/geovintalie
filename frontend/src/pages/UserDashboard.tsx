import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, HelpCircle, MapPin, Store, Boxes, ShoppingCart, LogOut,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isUser = user?.tipo_nome === 'user';

  useEffect(() => {
    // só redireciona depois que o usuário foi carregado (user !== null)
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
      setMessage('Propriedade registrada com sucesso. Rua e bairro inexistentes foram criados automaticamente.'); setMessageKind('success');
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
      setMessage('Produto cadastrado e vinculado à propriedade.'); setMessageKind('success');
      setProdForm({ name: '', tipo: '', price: '', property_id: '' });
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Erro ao cadastrar produto.'); setMessageKind('error');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen bg-[#0f172a] text-slate-200 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <Building2 size={26} className="text-emerald-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white">Painel do Usuário</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Conectado como <b className="text-emerald-400">{user?.name}</b> ({user?.tipo_nome})</span>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-1">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={22} className="text-emerald-400" aria-hidden="true" />
          <h3 className="text-xl font-bold text-white">Cadastrar Propriedade</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Informe o nome e número da propriedade, além da rua e bairro. <span className="text-emerald-300 font-medium"><HelpCircle size={14} className="inline mr-1" aria-hidden="true"/>Se a rua ou o bairro ainda não existirem no cadastro, eles são adicionados automaticamente pelo sistema.</span>
        </p>
        <form onSubmit={handleRegisterProperty} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Nome da loja</label>
            <input value={propForm.name} onChange={(e) => setPropForm({...propForm, name: e.target.value})} placeholder="Ex: Farmácia Central" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Nº da propriedade</label>
            <input value={propForm.n_property} onChange={(e) => setPropForm({...propForm, n_property: e.target.value})} placeholder="Ex: 101" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Rua</label>
            <input value={propForm.street} onChange={(e) => setPropForm({...propForm, street: e.target.value})} placeholder="Ex: Avenida São João" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Bairro</label>
            <input value={propForm.neighborhood} onChange={(e) => setPropForm({...propForm, neighborhood: e.target.value})} placeholder="Ex: Centro" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Cidade</label>
            <input value={propForm.city} onChange={(e) => setPropForm({...propForm, city: e.target.value})} placeholder="Ex: São Paulo" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Estado</label>
            <input value={propForm.state} onChange={(e) => setPropForm({...propForm, state: e.target.value})} placeholder="Ex: São Paulo" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">País</label>
            <input value={propForm.country} onChange={(e) => setPropForm({...propForm, country: e.target.value})} placeholder="Ex: Brasil" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">&nbsp;</label>
            <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg disabled:opacity-60">Registrar Propriedade</button>
          </div>
        </form>
        {message && <div className={`mt-3 p-3 rounded border ${messageKind === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' : 'border-rose-500 bg-rose-500/10 text-rose-200'}`}>{message}</div>}
      </section>

      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Boxes size={22} className="text-blue-400" aria-hidden="true" />
          <h3 className="text-xl font-bold text-white">Cadastrar Produto</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Vincule o produto a uma propriedade existente. <span className="text-blue-300 font-medium"><HelpCircle size={14} className="inline mr-1" aria-hidden="true"/>O vínculo usa o ID da propriedade e do produto — nenhum outro ID de chave estrangeira é exigido.</span>
        </p>
        <form onSubmit={handleRegisterProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Nome do produto</label>
            <input value={prodForm.name} onChange={(e) => setProdForm({...prodForm, name: e.target.value})} placeholder="Ex: Arroz 5kg" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Tipo</label>
            <input value={prodForm.tipo} onChange={(e) => setProdForm({...prodForm, tipo: e.target.value})} placeholder="Ex: alimento" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Preço (R$)</label>
            <input type="number" step="0.01" value={prodForm.price} onChange={(e) => setProdForm({...prodForm, price: e.target.value})} placeholder="19.90" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Vincular à propriedade</label>
            <select value={prodForm.property_id} onChange={(e) => setProdForm({...prodForm, property_id: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Selecione</option>
              {properties.map((p: any) => <option key={p.id} value={p.id}>{p.n_property} — {p.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">&nbsp;</label>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg disabled:opacity-60">Salvar Produto</button>
          </div>
        </form>
        {message && <div className={`mt-3 p-3 rounded border ${messageKind === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' : 'border-rose-500 bg-rose-500/10 text-rose-200'}`}>{message}</div>}
      </section>

      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Store size={22} className="text-amber-400" aria-hidden="true" />
          <h3 className="text-xl font-bold text-white">Minhas Propriedades</h3>
        </div>
        <p className="text-sm text-slate-400 mb-3">Clique em uma propriedade para ver os produtos que aquela loja possui.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.length === 0 ? (
            <p className="text-slate-400 text-center col-span-full">Nenhuma propriedade cadastrada ainda.</p>
          ) : (
            properties.map((p: any) => (
              <div key={p.id} className="border border-slate-700 rounded-xl p-4 hover:border-emerald-500/50 transition cursor-pointer" onClick={() => loadPropProducts(p.id)}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{p.name}</h4>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">#{p.n_property}</span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{p.street_id ? 'Rua cadastrada' : 'Endereço em cadastro'}</p>
                <button className="w-full text-sm text-emerald-400 hover:text-emerald-300 underline">Ver produtos <Store size={14} className="inline ml-1" aria-hidden="true"/></button>
              </div>
            ))
          )}
        </div>
      </section>

      {selectedProp && (
        <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={22} className="text-blue-400" aria-hidden="true" />
              <h3 className="text-xl font-bold text-white">Produtos de {selectedProp.name}</h3>
            </div>
            <button onClick={() => { setSelectedProp(null); setPropProducts([]); }} className="text-slate-400 hover:text-white">Voltar</button>
          </div>
          <p className="text-sm text-slate-400 mb-3">Estes são os produtos vinculados à loja selecionada.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {propProducts.length === 0 ? (
              <p className="text-slate-400 text-center col-span-full">Esta propriedade ainda não possui produtos cadastrados.</p>
            ) : (
              propProducts.map((pr: any) => (
                <div key={pr.id} className="border border-slate-700 rounded-lg p-3 bg-slate-900/50">
                  <h4 className="font-semibold text-white">{pr.name}</h4>
                  <p className="text-sm text-slate-400">{pr.tipo || '—'}</p>
                  <p className="text-emerald-400 font-medium">R$ {Number(pr.price || 0).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}

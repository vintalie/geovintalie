import { useState, useEffect } from 'react';
import { MapPin, Store, ExternalLink, Copy, Code2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function MapPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('https://www.openstreetmap.org/export/embed.html?bbox=-46.68,-23.58,-46.54,-23.44&layer=mapnik');

  const meId = user?.id;

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/auth/properties');
      const data = r.data.propertys?.data ?? r.data.properties?.data ?? [];
      setProperties(meId ? data.filter((p: any) => p.user_id === meId) : data);
    } catch {
      setProperties([]);
    } finally { setLoading(false); }
  };

  const loadProducts = async (id: number) => {
    try {
      const r = await api.get(`/api/auth/properties/${id}/products`);
      setProducts(r.data.products ?? r.data.propertys?.data ?? []);
      setSelected(properties.find((p: any) => p.id === id) ?? null);
    } catch {
      setProducts([]);
      setSelected(null);
    }
  };

  const copyIframe = () => {
    const code = `<iframe src="${iframeUrl}" width="100%" height="500" style="border:0;" loading="lazy" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(code);
  };

  const directLink = iframeUrl.replace('/export/embed.html?', '');

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#0f172a] text-slate-200 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <MapPin size={26} className="text-amber-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white">Mapa de Propriedades</h1>
        </div>
        <p className="text-sm text-slate-400">
          As propriedades cadastradas aparecem abaixo. Clique em uma para ver os produtos daquela loja. O mapa pode ser acessado diretamente ou incorporado em outro site via iframe.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-slate-800/60 border border-slate-700 rounded-2xl p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Mapa (OpenStreetMap)</span>
            <div className="flex gap-1">
              <button onClick={() => setIframeUrl('https://www.openstreetmap.org/export/embed.html?bbox=-46.68,-23.58,-46.54,-23.44&layer=mapnik')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">São Paulo</button>
              <button onClick={() => setIframeUrl('https://www.openstreetmap.org/export/embed.html?bbox=-43.22,-22.93,-43.10,-22.86&layer=mapnik')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">Rio de Janeiro</button>
            </div>
          </div>
          <iframe
            title="Mapa de propriedades"
            src={iframeUrl}
            className="w-full flex-1 rounded-xl border border-slate-700 bg-slate-900"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="mt-3 flex gap-2">
            <input
              value={iframeUrl}
              onChange={(e) => setIframeUrl(e.target.value)}
              placeholder="Cole a URL do mapa para incorporar"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button onClick={copyIframe} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-xs flex items-center gap-1">
              <Copy size={14} /> Copiar iframe
            </button>
            <a href={directLink} target="_blank" rel="noopener noreferrer" className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-xs flex items-center gap-1">
              <ExternalLink size={14} /> Acesso direto
            </a>
          </div>
          <p className="mt-2 text-xs text-slate-500">Código para incorporar no seu site:</p>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 font-mono overflow-x-auto">&lt;iframe src="{iframeUrl}" width="100%" height="500" style="border:0;" loading="lazy" allowfullscreen&gt;&lt;/iframe&gt;</div>
        </section>

        <section className="lg:col-span-5 bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Store size={20} className="text-emerald-400" aria-hidden="true" />
              <h3 className="text-base font-bold text-white">Propriedades</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900 border border-slate-700 rounded px-2 py-0.5">{properties.length}</span>
          </div>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-slate-500 text-xs">Carregando…</div>
          ) : properties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
              Nenhuma propriedade cadastrada.<br className="hidden md:block" />Cadastre uma no painel do usuário.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {properties.map((p: any) => (
                <div
                  key={p.id}
                  className={`border rounded-lg p-3 cursor-pointer transition ${selected?.id === p.id ? 'bg-emerald-500/10 border-emerald-400' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                  onClick={() => loadProducts(p.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-white">{p.name}</h4>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">#{p.n_property}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">Rua cadastrada: {p.street_id ? 'sim' : 'em cadastro'}</p>
                  <span className="text-[11px] text-emerald-400 font-medium">Clique para ver produtos</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && (
        <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code2 size={20} className="text-blue-400" aria-hidden="true" />
              <h3 className="text-lg font-bold text-white">Produtos de {selected.name}</h3>
            </div>
            <button onClick={() => { setSelected(null); setProducts([]); }} className="text-slate-400 hover:text-white text-sm">Fechar</button>
          </div>
          <p className="text-sm text-slate-400 mb-3">Produtos que a loja "{selected.name}" possui:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.length === 0 ? (
              <p className="text-slate-400 text-center col-span-full">Esta loja ainda não possui produtos cadastrados.</p>
            ) : (
              products.map((pr: any) => (
                <div key={pr.id} className="border border-slate-700 rounded-lg p-3 bg-slate-900/50">
                  <h4 className="font-semibold text-white">{pr.name}</h4>
                  <p className="text-xs text-slate-400">{pr.tipo || '—'}</p>
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

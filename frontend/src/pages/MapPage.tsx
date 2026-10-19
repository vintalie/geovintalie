import { useState } from 'react';
import { MapPin, Store, ExternalLink } from 'lucide-react';

export default function MapPage() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(1);
  const [iframeUrl, setIframeUrl] = useState('https://www.google.com/maps/embed');

  const properties = [
    { id: 1, name: 'Loja Central', lat: -23.55, lng: -46.63, products: ['Produto A', 'Produto B'] },
    { id: 2, name: 'Filial Norte', lat: -23.57, lng: -46.60, products: ['Produto C'] },
  ];

  const selected = properties.find((p) => p.id === selectedProperty);

  return (
    <main className="p-6 md:p-10 bg-stone-950 text-stone-100 min-h-screen space-y-6">
      <header className="flex items-center gap-3">
        <MapPin size={28} aria-hidden="true" />
        <h2 className="text-3xl font-extrabold">Mapa de Propriedades</h2>
      </header>
      <p className="text-stone-400">Clique em uma propriedade para visualizar os produtos daquela loja. É possível importar via iframe ou acessar diretamente.</p>

      <section className="grid md:grid-cols-3 gap-4">
        {properties.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProperty(p.id)}
            className={`text-left rounded-2xl p-5 border shadow-lg transition-all ${selectedProperty === p.id ? 'bg-amber-950/40 border-amber-400' : 'bg-stone-900 border-stone-800 hover:border-slate-700'}`}
          >
            <h4 className="font-bold text-lg flex items-center gap-2"><Store size={18} /> {p.name}</h4>
            <p className="text-sm text-stone-400 mt-1">Produtos: {p.products.join(', ')}</p>
            <a href="#" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-2"><ExternalLink size={14} /> Acesso direto</a>
          </button>
        ))}
      </section>

      <section className="bg-stone-900 rounded-2xl p-6 border border-stone-800 shadow-xl space-y-4">
        <h3 className="text-xl font-bold">Mapa Interativo</h3>
        <p className="text-stone-400">Se preferir importar via iframe, utilize a URL abaixo diretamente em seu site.</p>
        <input value={iframeUrl} onChange={(e) => setIframeUrl(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mb-2" />
        <iframe title="Mapa" src={iframeUrl} className="w-full h-96 rounded-2xl border border-stone-800 shadow-lg" />
        {selected && (
          <div className="bg-amber-950/30 border border-amber-700 rounded-xl p-4">
            <h4 className="font-bold">Produtos de {selected.name}</h4>
            <ul className="list-disc pl-5 text-slate-300 mt-1">
              {selected.products.map((pr) => <li key={pr}>{pr}</li>)}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}

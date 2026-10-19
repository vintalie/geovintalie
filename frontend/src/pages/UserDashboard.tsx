import { useState } from 'react';
import { Building2, HelpCircle, MapPin, FileUp } from 'lucide-react';

export default function UserDashboard() {
  const [property, setProperty] = useState({ name: '', street: '', neighborhood: '', n_property: '' });
  const [message, setMessage] = useState('');

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Propriedade registrada. Rua e bairro foram adicionados automaticamente quando não existiam.');
  };

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10 space-y-10 bg-stone-950 text-stone-100 min-h-screen">
      <header className="flex items-center gap-3">
        <Building2 size={28} aria-hidden="true" />
        <h2 className="text-3xl font-extrabold">Painel do Usuário</h2>
      </header>

      <section className="bg-stone-900 rounded-2xl p-6 shadow-xl border border-stone-800 space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><MapPin size={22} /> Cadastrar Propriedade</h3>
        <p className="text-stone-400">Informe o nome, número da propriedade, rua e bairro. Se a rua ou bairro não existirem, eles são adicionados automaticamente pelo sistema.</p>
        <form onSubmit={handlePropertySubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label htmlFor="p-name" className="block text-sm font-medium mb-1">Nome da loja <HelpCircle size={14} className="inline text-blue-400 ml-1" aria-label="Explicação do campo" /></label><input id="p-name" placeholder="Ex: Farmácia Central" value={property.name} onChange={(e) => setProperty({ ...property, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
            <div><label htmlFor="p-num" className="block text-sm font-medium mb-1">Número da propriedade</label><input id="p-num" placeholder="Ex: 101" value={property.n_property} onChange={(e) => setProperty({ ...property, n_property: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label htmlFor="p-street" className="block text-sm font-medium mb-1">Rua</label><input id="p-street" placeholder="Ex: Avenida São João" value={property.street} onChange={(e) => setProperty({ ...property, street: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
            <div><label htmlFor="p-neigh" className="block text-sm font-medium mb-1">Bairro</label><input id="p-neigh" placeholder="Ex: Centro" value={property.neighborhood} onChange={(e) => setProperty({ ...property, neighborhood: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-colors">Registrar Propriedade</button>
        </form>
        {message && <div className="bg-amber-950/40 text-emerald-200 rounded-lg px-4 py-3 border border-emerald-700">{message}</div>}
      </section>

      <section className="bg-stone-900 rounded-2xl p-6 shadow-xl border border-stone-800 space-y-4">
        <h3 className="text-xl font-bold">Cadastrar Produtos</h3>
        <p className="text-stone-400">Adicione produtos e vincule à propriedade selecionada. O vínculo usa apenas o ID da propriedade e do produto.</p>
        <div className="space-y-3">
          <input placeholder="Nome do produto" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
          <input placeholder="Preço" type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
          <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            <option>Vincular à propriedade</option>
            <option>101 — Loja Central</option>
          </select>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-colors">Salvar Produto</button>
      </section>

      <section className="bg-stone-900 rounded-2xl p-6 shadow-xl border border-stone-800 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2"><FileUp size={22} /> Mapa</h3>
        <p className="text-stone-400">Visualize as propriedades registradas. Ao clicar em uma propriedade, você verá os produtos daquela loja. É possível importar via iframe ou acessar diretamente.</p>
        <div className="bg-slate-800 rounded-xl h-64 flex items-center justify-center text-slate-500 border border-slate-700">
          <span>Mapa interativo — propriedades do usuário com produtos ao clicar</span>
        </div>
      </section>
    </main>
  );
}

import { useState } from 'react';
import { Download, Upload, Table2 } from 'lucide-react';

export default function AdminDashboard() {
  const [rows, setRows] = useState([
    { id: 1, name: 'Loja Central', n_property: '101', street_id: 1, price: 0 },
    { id: 2, name: 'Filial Norte', n_property: '102', street_id: 2, price: 150 },
  ]);

  const handleChange = (id: number, field: string, val: string | number) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(rows)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dados.json'; a.click(); URL.revokeObjectURL(url);
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { try { const d = JSON.parse(reader.result as string); setRows(Array.isArray(d) ? d : rows); } catch { /* ignore */ }; };
    reader.readAsText(f);
  };

  return (
    <main className="p-6 md:p-10 space-y-6 bg-stone-950 text-stone-100 min-h-screen">
      <header className="flex items-center gap-3">
        <Table2 size={28} className="text-amber-400" aria-hidden="true" />
        <h2 className="text-3xl font-extrabold">Administração — Tabela Editável</h2>
      </header>
      <p className="text-slate-400">Esta tabela permite editar qualquer campo do banco de dados. Apenas o ID da propriedade/produto é usado como referência de chave estrangeira.</p>

      <div className="flex gap-3">
        <button onClick={exportJSON} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg shadow"><Download size={18} /> Exportar JSON</button>
        <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg shadow cursor-pointer"><Upload size={18} /> Importar JSON <input type="file" accept=".json" className="hidden" onChange={importJSON} /></label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              {['ID', 'Nome', 'Nº Propriedade', 'Rua ID', 'Preço', 'Ações'].map((h) => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-800 hover:bg-slate-900">
                <td className="px-4 py-3">{r.id}</td>
                <td><input value={r.name} onChange={(e) => handleChange(r.id, 'name', e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-full" /></td>
                <td><input value={r.n_property} onChange={(e) => handleChange(r.id, 'n_property', e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-full" /></td>
                <td><input type="number" value={r.street_id} onChange={(e) => handleChange(r.id, 'street_id', Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-full" /></td>
                <td><input type="number" value={r.price} onChange={(e) => handleChange(r.id, 'price', Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-full" /></td>
                <td><button onClick={() => setRows(rows.filter((x) => x.id !== r.id))} className="text-rose-400 hover:text-rose-300 font-medium">Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

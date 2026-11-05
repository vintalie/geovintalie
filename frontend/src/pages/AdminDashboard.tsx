import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, Download, RefreshCw, ShieldAlert } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

type Row = Record<string, any>;

const RESOURCES: Record<string, { label: string; path: string; titleField: string }> = {
  properties: { label: 'Propriedades', path: '/api/auth/properties', titleField: 'name' },
  products: { label: 'Produtos', path: '/api/auth/products', titleField: 'name' },
  users: { label: 'Usuários', path: '/api/auth/user', titleField: 'name' },
  countries: { label: 'Países', path: '/api/auth/location/countries', titleField: 'name' },
  states: { label: 'Estados', path: '/api/auth/location/states', titleField: 'name' },
  cities: { label: 'Cidades', path: '/api/auth/location/cities', titleField: 'name' },
  neighborhoods: { label: 'Bairros', path: '/api/auth/location/neighborhoods', titleField: 'name' },
  streets: { label: 'Ruas', path: '/api/auth/location/streets', titleField: 'name' },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.tipo_nome === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      logout();
      navigate('/login');
    }
  }, [isAdmin, logout, navigate]);

  const [resourceKey, setResourceKey] = useState('properties');
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRow, setNewRow] = useState<Row>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [message, setMessage] = useState({ text: '', kind: 'info' as 'info' | 'success' | 'error' });

  const res = RESOURCES[resourceKey];

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const response = await api.get(res.path, { params: { page: p, per_page: perPage } });
      const body = response.data;
      const paginator = body.propertys ?? body.properties ?? body.data ?? body;
      const data = paginator.data ?? paginator;
      // admin vê tudo; o backend já restringe o user (mas esta página é só admin)
      setRows(Array.isArray(data) ? data : []);
      setMeta({
        current_page: paginator.current_page ?? p,
        last_page: paginator.last_page ?? p,
        total: paginator.total ?? data.length,
        per_page: paginator.per_page ?? perPage,
      });
      setMessage({ text: '', kind: 'info' });
    } catch (err: any) {
      setMessage({ text: `Erro ao carregar ${res.label}: ${err.response?.data?.message || err.message}`, kind: 'error' });
    } finally {
      setLoading(false);
    }
  }, [res.path, perPage]);

  useEffect(() => { load(page); }, [resourceKey, load, page]);

  const fields = useCallback(() => {
    if (rows.length === 0) return Object.keys(newRow);
    return Object.keys(rows[0]);
  }, [rows, newRow]);

  const visibleRows = useMemo(() => rows.filter((r) =>
    Object.values(r).some((v) => v != null && String(v).toLowerCase().includes(search.toLowerCase()))
  ), [rows, search]);

  const handleChange = (rowIndex: number, field: string, value: string) => {
    setRows(rows.map((r, i) => i === rowIndex ? { ...r, [field]: value } : r));
  };

  const handleNewChange = (field: string, value: string) => {
    setNewRow({ ...newRow, [field]: value });
  };

  const addRow = () => {
    const next = { ...newRow };
    // nunca envie id vazio para criação
    if (next.id === '' || next.id == null) delete next.id;
    setRows([...rows, next]);
    setNewRow({});
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    let ok = true;
    for (const row of rows) {
      const id = row.id;
      const body = { ...row };
      delete body.$$new;
      try {
        if (id) {
          await api.put(`${res.path}/${id}`, body);
        } else {
          await api.post(res.path, body);
        }
      } catch (err: any) {
        ok = false;
        setMessage({ text: `Erro ao salvar ${res.titleField} id=${id}: ${err.response?.data?.message || err.message}`, kind: 'error' });
      }
    }
    if (ok) {
      setMessage({ text: 'Alterações salvas com sucesso.', kind: 'success' });
      load(page);
    }
    setSaving(false);
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result as string);
        const arr = Array.isArray(d) ? d : (d.rows ?? d[res.label] ?? []);
        const cleaned = arr.map((r: Row) => {
          const c: Row = {};
          for (const [k, v] of Object.entries(r)) {
            if (['created_at', 'updated_at', 'email_verified_at', 'password'].includes(k)) continue;
            c[k] = v;
          }
          return c;
        });
        setRows([...rows, ...cleaned]);
        setMessage({ text: `${cleaned.length} ${res.label} importados. Clique em Salvar para enviar à API.`, kind: 'success' });
      } catch { setMessage({ text: 'Arquivo JSON inválido.', kind: 'error' }); }
    };
    reader.readAsText(f);
  };

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#0f172a] text-slate-200">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={24} className="text-amber-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-white">Administração — Tabela Geral Editável</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Edite qualquer campo do banco de dados célula a célula. O ID da propriedade/produto é usado como referência;
            outros vínculos (rua, bairro, usuário) usam nomes/endereços — nunca IDs de chave estrangeira expostos ao usuário final.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={resourceKey}
            onChange={(e) => { setResourceKey(e.target.value); setPage(1); setRows([]); setNewRow({}); }}
            className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-2 focus:ring-2 focus:ring-amber-500"
          >
            {Object.entries(RESOURCES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={() => load(page)} disabled={loading} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded disabled:opacity-50">
            <RefreshCw size={16} /> Recarregar
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-50">
            <Save size={16} /> Salvar alterações na API
          </button>
        </div>
      </header>

      {message.text && (
        <div className={`mb-4 p-3 rounded border ${message.kind === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' : message.kind === 'error' ? 'border-rose-500 bg-rose-500/10 text-rose-200' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <input
          placeholder={`Buscar em ${res.label}…`}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-500"
        />
        <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded cursor-pointer">
          <Download size={16} /> Exportar JSON
          <input type="file" accept=".json" className="hidden" onChange={importJSON} />
        </label>
        <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded cursor-pointer">
          <Upload size={16} /> Importar JSON
          <input type="file" accept=".json" className="hidden" onChange={importJSON} />
        </label>
      </div>

      <div className="overflow-x-auto border border-slate-700 rounded-xl shadow-2xl">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-800 border-b border-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium border-b border-slate-600 sticky top-0 bg-slate-800">#</th>
              {fields().map((f) => (
                <th key={f} className="px-3 py-2 font-medium border-b border-slate-600">{f}</th>
              ))}
              <th className="px-3 py-2 font-medium border-b border-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={row.id ?? i} className="border-t border-slate-700 hover:bg-slate-800/50">
                <td className="px-3 py-2 border-b border-slate-700 text-slate-400">{row.id ?? 'novo'}</td>
                {fields().map((f) => (
                  <td key={f} className="px-3 py-2 border-b border-slate-700">
                    <input
                      value={row[f] == null ? '' : row[f]}
                      onChange={(e) => handleChange(i, f, e.target.value)}
                      className="bg-transparent border-b border-slate-600 text-white w-full px-1 focus:border-amber-500 focus:outline-none"
                      disabled={f === 'id' && row.id}
                    />
                  </td>
                ))}
                <td className="px-3 py-2 border-b border-slate-700">
                  <button onClick={() => removeRow(i)} className="text-rose-400 hover:text-rose-300 text-sm" title="Remover linha">×</button>
                </td>
              </tr>
            ))}
            <tr className="bg-slate-900/50 border-t border-slate-700">
              <td className="px-3 py-2 text-slate-400 text-xs">nova</td>
              {fields().map((f) => (
                <td key={f} className="px-3 py-2 border-b border-slate-700">
                  <input
                    value={newRow[f] == null ? '' : newRow[f]}
                    onChange={(e) => handleNewChange(f, e.target.value)}
                    placeholder={f}
                    className="bg-transparent border-b border-slate-600 text-white w-full px-1 focus:border-blue-500 focus:outline-none"
                  />
                </td>
              ))}
              <td className="px-3 py-2 border-b border-slate-700">
                <button onClick={addRow} className="text-emerald-400 hover:text-emerald-300 text-sm" title="Adicionar linha">+</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Página {meta.current_page} de {meta.last_page} &middot; {meta.total} {res.label.toLowerCase()}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-2 py-1 rounded border border-slate-600 text-slate-400 hover:text-white disabled:opacity-40"
            >Anterior</button>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page || loading}
              className="px-2 py-1 rounded border border-slate-600 text-slate-400 hover:text-white disabled:opacity-40"
            >Próxima</button>
          </div>
        </div>
      )}

      <footer className="mt-8 border-t border-slate-700 pt-4 text-xs text-slate-500">
        Apenas o administrador ({user?.name}) acessa este painel. Os links de chave estrangeira são resolvidos por nome/endereço na API;
        apenas o ID da própria propriedade/produto é exposto como referência.
      </footer>
    </main>
  );
}

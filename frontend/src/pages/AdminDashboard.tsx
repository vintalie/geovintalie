import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, Download, RefreshCw, ShieldAlert } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <main className="min-h-screen bg-background">
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-accent" aria-hidden="true" />
            Administração — Tabela Geral Editável
          </CardTitle>
          <CardDescription>
            Edite qualquer campo do banco de dados célula a célula. O ID da propriedade/produto é usado como referência;
            outros vínculos (rua, bairro, usuário) usam nomes/endereços — nunca IDs de chave estrangeira expostos ao usuário final.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <Select
              value={resourceKey}
              onValueChange={(v: string) => { setResourceKey(v); setPage(1); setRows([]); setNewRow({}); }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RESOURCES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => load(page)} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> Recarregar
            </Button>
            <Button onClick={save} disabled={saving} className="ml-auto">
              <Save className="h-4 w-4 mr-2" /> Salvar alterações na API
            </Button>
          </div>
          {message.text && (
            <div className="mb-4 p-3 rounded border shadow-card">
              {message.text}
            </div>
          )}
          <div className="flex gap-3 mb-4">
            <Input
              placeholder={`Buscar em ${res.label}…`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-[300px]"
            />
            <Button asChild variant="outline">
              <label className="cursor-pointer flex items-center gap-2">
                <Download className="h-4 w-4" /> Exportar JSON
                <input type="file" accept=".json" className="hidden" onChange={importJSON} />
              </label>
            </Button>
            <Button asChild variant="outline">
              <label className="cursor-pointer flex items-center gap-2">
                <Upload className="h-4 w-4" /> Importar JSON
                <input type="file" accept=".json" className="hidden" onChange={importJSON} />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 font-medium text-muted-foreground border-b sticky top-0">#</th>
                  {fields().map((f) => (
                    <th key={f} className="px-3 py-2 font-medium text-muted-foreground border-b">{f}</th>
                  ))}
                  <th className="px-3 py-2 font-medium text-muted-foreground border-b">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, i) => (
                  <tr key={row.id ?? i} className="border-b hover:bg-muted/50">
                    <td className="px-3 py-2 text-muted-foreground">{row.id ?? 'novo'}</td>
                    {fields().map((f) => (
                      <td key={f} className="px-3 py-2 border-b">
                        <input
                          value={row[f] == null ? '' : row[f]}
                          onChange={(e) => handleChange(i, f, e.target.value)}
                          className="bg-transparent border-b border-transparent focus:border-ring focus:outline-none w-full px-1"
                          disabled={f === 'id' && row.id}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 border-b">
                      <button onClick={() => removeRow(i)} className="text-destructive hover:text-destructive/90 text-sm" title="Remover linha">×</button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/50 border-t">
                  <td className="px-3 py-2 text-muted-foreground text-xs">nova</td>
                  {fields().map((f) => (
                    <td key={f} className="px-3 py-2 border-b">
                      <input
                        value={newRow[f] == null ? '' : newRow[f]}
                        onChange={(e) => handleNewChange(f, e.target.value)}
                        placeholder={f}
                        className="bg-transparent border-b border-transparent focus:border-ring focus:outline-none w-full px-1"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 border-b">
                    <button onClick={addRow} className="text-primary hover:text-primary/90 text-sm" title="Adicionar linha">+</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {meta && (
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Página {meta.current_page} de {meta.last_page} · {meta.total} {res.label.toLowerCase()}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page >= meta.last_page || loading}>
              Próxima
            </Button>
          </div>
        </div>
      )}

      <footer className="mt-8 pt-4 text-xs text-muted-foreground">
        Apenas o administrador ({user?.name}) acessa este painel. Os links de chave estrangeira são resolvidos por nome/endereço na API;
        apenas o ID da própria propriedade/produto é exposto como referência.
      </footer>
    </main>
  );
}

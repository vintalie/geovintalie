import { useState } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

type Row = Record<string, any>;

export default function ImportExport() {
  const { user } = useAuth();
  const [message, setMessage] = useState({ text: '', kind: 'info' as 'info' | 'success' | 'error' });
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState('');

  const meId = user?.id;

  const notify = (text: string, kind: 'info' | 'success' | 'error') => setMessage({ text, kind });

  const exportData = async () => {
    setLoading(true);
    try {
      const [propsRes, prodsRes] = await Promise.all([
        api.get('/api/auth/properties', { params: { per_page: 1000 } }),
        api.get('/api/auth/products', { params: { per_page: 1000 } }),
      ]);
      const props = propsRes.data.propertys?.data ?? propsRes.data.properties?.data ?? [];
      const products = prodsRes.data.products?.data ?? prodsRes.data.propertys?.data ?? [];
      const mine = meId ? props.filter((p: any) => p.user_id === meId) : props;
      const mineProducts = meId ? products.filter((p: any) => p.user_id === meId) : products;

      const payload = {
        exportedAt: new Date().toISOString(),
        properties: mine.map((p: Row) => ({
          id: p.id,
          name: p.name,
          n_property: p.n_property,
          complement: p.complement,
          main_image: p.main_image,
          cover_image: p.cover_image,
          content_html: p.content_html,
          additional_info: p.additional_info,
          contact1_email: p.contact1_email,
          contact2_email: p.contact2_email,
          number1: p.number1,
          number2: p.number2,
          number3: p.number3,
          street: p.street?.name ?? '',
          neighborhood: p.street?.neighborhood?.name ?? '',
          city: p.street?.neighborhood?.city?.name ?? '',
          state: p.street?.neighborhood?.city?.state?.name ?? '',
          country: p.street?.neighborhood?.city?.state?.country?.name ?? '',
        })),
        products: mineProducts.map((p: Row) => ({
          id: p.id,
          name: p.name,
          tipo: p.tipo,
          price: p.price,
          img_main: p.img_main,
          img_cover: p.img_cover,
          html: p.html,
          disabled: p.disabled,
          propriedade: p.property?.n_property ?? p.property_id,
        })),
      };

      setRaw(JSON.stringify(payload, null, 2));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `geovintalie-propriedades-produtos-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
      notify('Exportação concluída: propriedades e produtos em um único JSON (sem IDs de chave estrangeira).', 'success');
    } catch (e: any) {
      notify(`Erro ao exportar: ${e.response?.data?.message || e.message}`, 'error');
    } finally { setLoading(false); }
  };

  const importData = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const props: any[] = data.properties ?? [];
      const products: any[] = data.products ?? [];

      let createdP = 0, updatedP = 0;
      let createdPr = 0, updatedPr = 0;

      // propriedades primeiro (produtos dependem delas)
      for (const p of props) {
        const body: any = {
          name: p.name,
          n_property: p.n_property,
          street: p.street,
          neighborhood: p.neighborhood,
          city: p.city,
          state: p.state,
          country: p.country,
          complement: p.complement,
          main_image: p.main_image,
          cover_image: p.cover_image,
          content_html: p.content_html,
          additional_info: p.additional_info,
          contact1_email: p.contact1_email,
          contact2_email: p.contact2_email || p.contact1_email,
          number1: p.number1,
          number2: p.number2,
          number3: p.number3,
        };
        if (p.id) {
          await api.put(`/api/auth/properties/${p.id}`, body); updatedP++;
        } else {
          await api.post('/api/auth/properties', body); createdP++;
        }
      }

      // produtos depois
      for (const pr of products) {
        const body: any = {
          name: pr.name,
          tipo: pr.tipo,
          price: pr.price,
          property_id: pr.property_id,
        };
        if (pr.id) {
          await api.put(`/api/auth/products/${pr.id}`, body); updatedPr++;
        } else {
          await api.post('/api/auth/products', body); createdPr++;
        }
      }

      notify(`Importação concluída: ${createdP} propriedades criadas, ${updatedP} atualizadas; ${createdPr} produtos criados, ${updatedPr} atualizados.`, 'success');
      setRaw('');
    } catch (e: any) {
      notify(`Erro na importação: ${e.response?.data?.message || e.message}`, 'error');
    } finally { setLoading(false); }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    importData(f);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(raw);
    notify('JSON copiado para a área de transferência.', 'success');
  };

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8 min-h-screen bg-[#0f172a] text-slate-200 space-y-6">
      <header className="border-b border-slate-700 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText size={26} className="text-blue-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white">Importar / Exportar Dados</h1>
        </div>
        <p className="text-sm text-slate-400">
          Atualize propriedades e produtos de uma vez em um único arquivo JSON. Endereços são informados por extenso
          (país → estado → cidade → bairro → rua) e produtos pelo nome da propriedade — <b className="text-blue-300">nenhum ID de chave estrangeira é exigido</b>, apenas o ID da própria propriedade/produto quando for atualizar.
        </p>
      </header>

      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap gap-3 mb-4">
          <button onClick={exportData} disabled={loading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-60">
            <Download size={16} /> Exportar JSON
          </button>
          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
            <Upload size={16} /> Importar JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
          </label>
          <button onClick={() => setRaw('')} className="text-xs text-slate-400 hover:text-white underline">Limpar pré-visualização</button>
        </div>
        {loading && <p className="text-xs text-emerald-400">Processando importação…</p>}
        {message.text && (
          <div className={`mt-3 p-3 rounded border ${message.kind === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' : message.kind === 'error' ? 'border-rose-500 bg-rose-500/10 text-rose-200' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>{message.text}</div>
        )}
        {raw && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-slate-300">Pré-visualização / editar JSON</span>
              <button onClick={copyJson} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded">Copiar</button>
              <button onClick={() => setRaw('')} className="text-xs text-slate-500 hover:text-white underline">Limpar</button>
            </div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={10}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
      </section>

      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-3">Exemplo de JSON</h3>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 overflow-x-auto">{`{
  "properties": [
    {
      "name": "Farmácia Central",
      "n_property": "101",
      "street": "Avenida São João",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "São Paulo",
      "country": "Brasil",
      "contact1_email": "loja@exemplo.com",
      "number1": "11 3333-4444"
    }
  ],
  "products": [
    {
      "name": "Analgésico",
      "tipo": "medicamento",
      "price": 19.90,
      "propriedade": "101"
    }
  ]
}`}</div>
        <p className="mt-2 text-xs text-slate-500">
          Linhas com <code className="text-blue-300">id</code> existentes são atualizadas; sem <code className="text-blue-300">id</code> são criadas. Propriedades são processadas antes dos produtos.
        </p>
      </section>
    </main>
  );
}

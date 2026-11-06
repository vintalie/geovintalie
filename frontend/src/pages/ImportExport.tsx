import { useState } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
      a.href = url; a.download = `geovintalie-propriedades-produtos-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
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
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
            Importar / Exportar Dados
          </CardTitle>
          <CardDescription>
            Atualize propriedades e produtos de uma vez em um único arquivo JSON. Endereços são informados por extenso
            (país → estado → cidade → bairro → rua) e produtos pelo nome da propriedade — nenhum ID de chave estrangeira é exigido,
            apenas o ID da própria propriedade/produto quando for atualizar.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button onClick={exportData} disabled={loading}>
              <Download className="h-4 w-4 mr-2" /> Exportar JSON
            </Button>
            <Button asChild variant="outline">
              <label className="cursor-pointer flex items-center gap-2">
                <Upload className="h-4 w-4 mr-2" /> Importar JSON
                <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
              </label>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRaw('')}>
              Limpar pré-visualização
            </Button>
          </div>
          {loading && <Alert><AlertTitle>Processando</AlertTitle><AlertDescription>Importação em andamento…</AlertDescription></Alert>}
          {message.text && (
            <Alert variant={message.kind === 'error' ? 'destructive' : undefined}>
              <AlertTitle>{message.kind === 'success' ? 'Sucesso' : message.kind === 'error' ? 'Erro' : 'Info'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          {raw && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground">Pré-visualização / editar JSON</span>
                <Button variant="outline" size="sm" onClick={copyJson}>
                  Copiar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRaw('')}>
                  Limpar
                </Button>
              </div>
              <Textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={10}
                className="text-xs font-mono"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Exemplo de JSON</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto mb-4">
            {`{
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
}`}
          </div>
          <p className="text-xs text-muted-foreground">
            Linhas com <code className="text-primary">id</code> existentes são atualizadas; sem <code className="text-primary">id</code> são criadas. Propriedades são processadas antes dos produtos.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

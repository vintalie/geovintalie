import { useState, useEffect } from 'react';
import { MapPin, Store, ExternalLink, Copy, Code2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            Mapa de Propriedades
          </CardTitle>
          <CardDescription>
            As propriedades cadastradas aparecem abaixo. Clique em uma para ver os produtos daquela loja. O mapa pode ser acessado diretamente ou incorporado em outro site via iframe.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground">Mapa (OpenStreetMap)</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIframeUrl('https://www.openstreetmap.org/export/embed.html?bbox=-46.68,-23.58,-46.54,-23.44&layer=mapnik')}>
                São Paulo
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIframeUrl('https://www.openstreetmap.org/export/embed.html?bbox=-43.22,-22.93,-43.10,-22.86&layer=mapnik')}>
                Rio de Janeiro
              </Button>
            </div>
          </div>
          <div className="relative">
            <iframe
              title="Mapa de propriedades"
              src={iframeUrl}
              className="w-full h-[400px] rounded-xl border border-border bg-background"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              value={iframeUrl}
              onChange={(e) => setIframeUrl(e.target.value)}
              placeholder="Cole a URL do mapa para incorporar"
              className="flex-1 text-xs"
            />
            <Button onClick={copyIframe} size="sm" className="text-xs px-3 py-2">
              <Copy className="h-3 w-3 mr-2" /> Copiar iframe
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs px-3 py-2">
              <a href={directLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> Acesso direto
              </a>
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Código para incorporar no seu site:</p>
          <div className="bg-muted rounded-lg p-2 text-xs text-muted-foreground font-mono overflow-x-auto mb-4">
            &lt;iframe src="{iframeUrl}" width="100%" height="500" style="border:0;" loading="lazy" allowfullscreen&gt;&lt;/iframe&gt;
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7">
          <Card className="shadow-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-4 w-4 text-accent" aria-hidden="true" />
                Propriedades <Badge variant="secondary">{properties.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
              {loading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-xs">Carregando…</div>
              ) : properties.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs py-10">
                  Nenhuma propriedade cadastrada.<br className="hidden md:block" />Cadastre uma no painel do usuário.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2">
                  {properties.map((p: any) => (
                    <div
                      key={p.id}
                      className={`border rounded-lg p-3 cursor-pointer transition ${selected?.id === p.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent'}`}
                      onClick={() => loadProducts(p.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold">{p.name}</h4>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">#{p.n_property}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-2">Rua cadastrada: {p.street_id ? 'sim' : 'em cadastro'}</p>
                      <span className="text-[11px] text-primary font-medium">Clique para ver produtos</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-5">
          {selected && (
            <Card className="shadow-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Produtos de {selected.name}
                </CardTitle>
                <button
                  onClick={() => { setSelected(null); setProducts([]); }}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Fechar
                </button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Produtos que a loja "{selected.name}" possui:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.length === 0 ? (
                    <p className="text-muted-foreground text-center col-span-full text-sm">Esta loja ainda não possui produtos cadastrados.</p>
                  ) : (
                    products.map((pr: any) => (
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
        </section>
      </div>
    </main>
  );
}

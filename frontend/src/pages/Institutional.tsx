import { MessageCircle, Store, Boxes, MapPin, Code2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/SiteHeader';

const WHATSAPP = 'https://wa.me/5513981412290?text=' + encodeURIComponent('Olá, quero saber mais sobre o Mapa Local.');

const features = [
  { icon: Store, title: 'Cadastre lojas', text: 'Informe endereço por extenso. Ruas e bairros novos são criados automaticamente.' },
  { icon: Boxes, title: 'Vincule produtos', text: 'Cada produto pertence a uma loja, com preço, fotos, descrição e estoque.' },
  { icon: MapPin, title: 'Gere seu mapa', text: 'Um clique em uma loja mostra os produtos que ela possui.' },
  { icon: Code2, title: 'Incorpore', text: 'Use o link direto ou cole o código iframe no seu site.' },
  { icon: FileSpreadsheet, title: 'Importe / Exporte', text: 'Atualize lojas e produtos de uma vez com planilha ou JSON.' },
];

export default function Institutional() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <img
          src="/hero-map.jpg"
          alt="Mapa urbano com propriedades marcadas"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">Comércio local, no mapa</p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] md:text-7xl mb-6">
            Propriedades e produtos <span className="text-accent">no mapa</span>
          </h1>
          <p className="max-w-xl mx-auto mt-0 text-lg text-muted-foreground">
            Cadastre lojas, vincule produtos e publique mapas interativos com detalhes de cada endereço.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <h2 className="text-3xl font-bold md:text-4xl text-center mb-12">Como funciona</h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <f.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  {f.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {f.text}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-accent text-accent-foreground py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl mb-4">Vamos conversar?</h2>
          <p className="max-w-lg mx-auto mt-3 mb-8 opacity-90">
            Quer colocar seu comércio no mapa ou tirar dúvidas sobre o projeto? Fale com a gente pelo WhatsApp: (13) 98141-2290.
          </p>
          <Button asChild size="lg" className="mx-auto">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
            </a>
          </Button>
          <p className="mt-6 text-sm text-accent-foreground/80">
            Nenhum emoticon é utilizado neste projeto. Ícones são usados apenas para melhorar a navegabilidade.
          </p>
        </div>
      </section>
    </main>
  );
}

import { MessageCircle, Store, Boxes, MapPin, Code2, FileSpreadsheet } from 'lucide-react';

export default function Institutional() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2 font-display text-xl font-bold text-amber-400">
            <MapPin className="h-6 w-6 text-amber-400" /> Mapa Local
          </a>
          <nav className="flex items-center gap-3 text-sm font-medium text-stone-300">
            <a href="/institutional" className="hover:text-amber-400 transition-colors">Sobre</a>
            <a href="/map" className="hover:text-amber-400 transition-colors">Mapa</a>
            <a href="/login" className="hover:text-amber-400 transition-colors">Entrar</a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-amber-950 to-stone-950">
        <img src="/hero-map.jpg" alt="Mapa" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-white drop-shadow-lg">
            Propriedades e produtos <span className="text-amber-400">no mapa</span>
          </h1>
          <p className="text-xl md:text-2xl text-stone-300 max-w-3xl mx-auto">Cadastre lojas, vincule produtos e publique mapas interativos com detalhes de cada endereço.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">Como funciona</h2>
        <div className="grid md:grid-cols-5 gap-6">
          {[
            { icon: Store, title: "Cadastre lojas", text: "Informe endereço por extenso. Ruas e bairros novos são criados automaticamente." },
            { icon: Boxes, title: "Vincule produtos", text: "Cada produto pertence a uma loja, com preço, fotos, descrição e estoque." },
            { icon: MapPin, title: "Gere seu mapa", text: "Um clique em uma loja mostra os produtos que ela possui." },
            { icon: Code2, title: "Incorpore", text: "Use o link direto ou cole o código iframe no seu site." },
            { icon: FileSpreadsheet, title: "Importe / Exporte", text: "Atualize lojas e produtos de uma vez com planilha ou JSON." },
          ].map((f) => (
            <div key={f.title} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 hover:border-amber-500/40 transition-colors shadow-xl">
              <f.icon className="h-8 w-8 text-amber-400 mb-4" aria-hidden="true" />
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-stone-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center space-y-8">
        <a href="https://wa.me/5513981412290?text=Olá%2C%20quero%20saber%20mais%20sobre%20o%20Mapa%20Local." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-2xl transition-colors" aria-label="Abrir WhatsApp">
          <MessageCircle size={28} aria-hidden="true" /> Falar pelo WhatsApp — 13 981412290
        </a>
        <p className="text-xs text-stone-500">Nenhum emoticon é utilizado neste projeto. Ícones são usados apenas para melhorar a navegabilidade.</p>
      </section>
    </main>
  );
}

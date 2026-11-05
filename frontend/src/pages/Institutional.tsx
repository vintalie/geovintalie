import { MessageCircle, Store, Boxes, MapPin, Code2, FileSpreadsheet } from 'lucide-react';

export default function Institutional() {
  return (
    <main className="min-h-screen bg-[#0b1120] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1120]/90 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2 text-xl font-bold text-amber-400">
            <MapPin size={24} aria-hidden="true" /> Mapa Local
          </a>
          <nav className="flex items-center gap-3 text-sm font-medium text-slate-400">
            <a href="/institutional" className="text-slate-400 hover:text-white">Sobre</a>
            <a href="/map" className="text-slate-400 hover:text-white">Mapa</a>
            <a href="/login" className="text-slate-400 hover:text-white">Entrar</a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img
          src="/hero-map.jpg"
          alt="Mapa"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative container mx-auto py-10 text-center px-4">
          <h1 className="text-5xl font-bold mb-2 tracking-tight">
            Propriedades e produtos <span className="text-amber-400">no mapa</span>
          </h1>
          <p className="max-w-2xl mx-auto mt-3 text-slate-300">
            Cadastre lojas, vincule produtos e publique mapas interativos com detalhes de cada endereço.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-10 px-4">
        <h2 className="text-center text-4xl font-bold mb-10 tracking-tight">Como funciona</h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Store, title: "Cadastre lojas", text: "Informe endereço por extenso. Ruas e bairros novos são criados automaticamente." },
            { icon: Boxes, title: "Vincule produtos", text: "Cada produto pertence a uma loja, com preço, fotos, descrição e estoque." },
            { icon: MapPin, title: "Gere seu mapa", text: "Um clique em uma loja mostra os produtos que ela possui." },
            { icon: Code2, title: "Incorpore", text: "Use o link direto ou cole o código iframe no seu site." },
            { icon: FileSpreadsheet, title: "Importe / Exporte", text: "Atualize lojas e produtos de uma vez com planilha ou JSON." },
          ].map((f) => (
            <div key={f.title} className="bg-[#111827] border border-white/10 rounded-xl p-4 h-full shadow-card">
              <f.icon size={32} className="text-amber-400 mb-3" aria-hidden="true" />
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 mb-0">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto py-10 px-4 text-center">
        <a
          href="https://wa.me/5513981412290?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20Mapa%20Local."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-3 text-sm font-bold text-white bg-amber-500 rounded-xl shadow-card hover:bg-amber-400 transition-colors"
          aria-label="Abrir WhatsApp"
        >
          <MessageCircle size={28} aria-hidden="true" /> Falar pelo WhatsApp — 13 981412290
        </a>
        <p className="mt-4 text-sm text-slate-400">
          Nenhum emoticon é utilizado neste projeto. Ícones são usados apenas para melhorar a navegabilidade.
        </p>
      </section>
    </main>
  );
}

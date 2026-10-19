import { MessageCircle } from 'lucide-react';

export default function Institutional() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-16">
      <section className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Property Linker
        </h1>
        <p className="text-xl md:text-2xl text-emerald-100 leading-relaxed">
          Conecte propriedades e produtos em um único ecossistema. Cadastre lojas, vincule itens e visualize mapas interativos com todos os detalhes de cada endereço.
        </p>
        <p className="text-lg text-emerald-200">
          O projeto permite que usuários registrem propriedades com criação automática de ruas e bairros, adicione produtos vinculados e gere mapas exportáveis via iframe ou acesso direto.
        </p>
        <a
          href="https://wa.me/5513981412290"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl transition-colors"
          aria-label="Abrir WhatsApp"
        >
          <MessageCircle size={28} aria-hidden="true" />
          Falar pelo WhatsApp — 13 981412290
        </a>
        <p className="text-sm text-emerald-300 pt-4">
          Nenhum emoticon é utilizado neste projeto. Ícones são usados apenas para melhorar a navegabilidade.
        </p>
      </section>
    </main>
  );
}

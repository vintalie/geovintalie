# Diagnóstico — Estilos Não Aplicados (Geovintalie Frontend)

## Causas Identificadas

1. **Mistura de frameworks**: `index.css` usa Tailwind (`@tailwind base/components/utilities`), mas o `package.json` inclui `bootstrap` e o `main.tsx` importa `bootstrap/dist/css/bootstrap.min.css`. Não há `tailwind.config.js`, então as classes Tailwind (`bg-stone-950`, `text-amber`, `backdrop-blur-md`) não são processadas e são ignoradas pelo navegador.

2. **Ordem de importação incorreta (corrigida)**: `index.css` era importado antes do Bootstrap. Agora Bootstrap vem primeiro, `index.css` depois.

3. **Classes Tailwind residuais em Institutional.tsx**: `font-family-sans-serif`, `drop-shadow-lg`, `text-white/90`, `backdrop-blur-md`, `flex`, `items-center`, `gap-3`, `rounded-2xl`, `shadow-xl`, `hover:bg-amber-500/40` são classes Tailwind que não funcionam sem configuração.

4. **Build passa, mas CSS não renderiza corretamente**: `npm run build` completa (2.16s) sem erro, mas o navegador não aplica estilos porque as classes não existem no CSS gerado.

5. **index.html sem link Bootstrap (corrigido)**: Adicionado via CDN.

## Plano de Correção

- [x] P1: Corrigir ordem de importação em `main.tsx` (Bootstrap antes `index.css`)
- [~] P2: Padronizar `Institutional.tsx` para classes Bootstrap puras (substituir Tailwind residuais)
- [ ] P3: Corrigir `AdminDashboard.tsx`, `UserDashboard.tsx`, `Dashboard.tsx`, `MapPage.tsx`, `Profile.tsx`
- [ ] P4: Executar `npm run build` e verificar `curl -L http://localhost:5173/`
- [ ] P5: Confirmar visualmente no navegador (`npm run dev`)

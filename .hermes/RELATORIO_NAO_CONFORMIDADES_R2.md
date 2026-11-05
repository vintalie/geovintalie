# RELATÓRIO DE NÃO-CONFORMIDADES — Validação R2 (geovintalie)

**Repositório:** /home/mario/Documentos/geovintalie
**Branch:** feature/scopes-r2-2026 (contexto citava "geovntatie", o diretório real é "geovintalie")
**Referência:** .hermes/escopo.md (critérios de aceitação) e .hermes/RELATORIO_LACUNAS.md
**Perfil OpenRouter:** kilo nvidia/nemotron-3.5-super-vl:free

---

## VEREDICTO GERAL

**REPROVADO com ressalvas** — requisitos de API, design system property-linker, 5 páginas solicitadas e perfil OpenRouter estão CONFORME. Há não-conformidades em: (a) classes Bootstrap/`text-white` em páginas fora do escopo das 5 solicitadas, (b) build do GitHub Pages não reproduzível limpo (TS5101 pré-existente), (c) fluxo GitHub retroativo não concluído no GitHub remoto (PR não criado, sem GH_TOKEN).

---

## 1. CRITÉRIOS DE ACEITAÇÃO — RESULTADO POR ITEM

| # | Critério (escopo.md) | Status | Evidência |
|---|----------------------|--------|-----------|
| 1 | API responde localmente em dev (migrations/config OK) | ✓ CONFORME | `database.sqlite` (212 KB), 21/21 migrations "Ran" (incl. R2: service_providers, service_categories, service_listings, product_geo_index, feature_flags, user_consents). `GET /api/v2/public/properties` → HTTP 200. Rotas protegidas → 401 (esperado). Inexistente → 404. |
| 2 | Frontend dev conecta à API local (VITE_API_URL = localhost:8000) | ✓ CONFORME | `frontend/src/api/axios.ts:5` `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'`. Rotas /login, /institutional, /dashboard, /admin, /map, /user configuradas em `frontend/src/routes/index.tsx`. |
| 3 | Build do frontend gerado p/ GitHub Pages, apontando API local | ⚠ PARCIAL | `frontend/dist/` existe e está COMMITADO (não está em .gitignore). `dist/index.html` usa base `/geovintalie/`. `vite.config.ts:9` `base: '/geovintalie/'` em produção. **PORÉM** `npm run build` falha com TS5101 (`baseUrl` depreciado no TS 6.0 — `tsconfig.app.json:24`, pré-existente, não causado por esta validação). Build não é regenerável limpo atualmente. |
| 4 | Fluxo GitHub retroativo aplicado (issues/PRs/comentários/commits) | ✗ NÃO CONFORME (parcial) | Branch `feature/scopes-r2-2026` existe local e remoto (origin/). 18 issues #6-#23 mapeadas (`.created_issues`, RELATORIO_LACUNAS §7). `.hermes/cron_retroativo.sh` pronto e `.hermes/GITHUB_RETROATIVO_APLICADO.md` documentam o fluxo. **FALTA:** PR não criado no GitHub (status "pendente de criação", RELATORIO_LACUNAS §6); sem GH_TOKEN configurado, não há PR, revisões ou comentários registrados no remoto. |
| 5 | Projeto em estado funcional p/ desenvolvimento local | ✓ CONFORME | API roda em 127.0.0.1:8000, banco populado, migrations aplicadas, frontend buildado. |
| 6 | Perfis OpenRouter usam kilo nvidia/nemotron-3.5-super-vl:free | ✓ CONFORME | `.hermes/profiles/orquestrador/config.yaml`: `model.default: nvidia/nemotron-3.5-super-vl:free`, `provider: kilo`, `base_url: https://api.kilo.ai/api/gateway`. Fallback também inclui kilocode nvidia/nemotron-3.5-super-vl:free. |
| 7 | Nenhuma classe Bootstrap nas páginas (bg-dark, text-white, container-fluid, btn, etc.) | ✗ NÃO CONFORME | As 5 páginas solicitadas estão limpas. Outras páginas contêm classes proibidas (detalhe na seção 2). |
| 8 | Design system property-linker (oklch tokens, shadcn/ui, Tailwind) | ✓ CONFORME | `frontend/src/index.css`: `@import "tailwindcss"`, `@import "tw-animate-css"`, tokens `--background: oklch(0.975 0.012 85)` etc., `@utility shadow-card`, `@utility bg-hero-fade`, `@utility grid-paper`. Componentes shadcn/ui (Card, Button, Input, Label, Tabs, Badge, Select). |
| 9 | /login com visual property-linker (não o antigo) | ✓ CONFORME | `frontend/src/pages/Auth/Login.tsx`: Card shadcn, Tabs login/register, `grid-paper`/`bg-background`, sem classes Bootstrap. |
| 10 | /institutional: hero, Como funciona, WhatsApp, sem emoticons | ✓ CONFORME | `frontend/src/pages/Institutional.tsx`: hero com `hero-map.jpg`, seção "Como funciona" (grid de cards), botão WhatsApp `wa.me/5513981412290`, aviso "Nenhum emoticon é utilizado neste projeto." |

---

## 2. NÃO-CONFORMIDADES DETALHADAS

### NC-01 — Classes Bootstrap presentes em páginas do frontend (critério #7)
**Severidade:** Alta  
**Critério violado:** "Nenhuma classe Bootstrap nas páginas (bg-dark, text-white, container-fluid, btn, etc.)"

Ocorrências encontradas via busca em `frontend/src/**/*.tsx`:

- `frontend/src/pages/Products/PropertyList.tsx:69` — `className="btn btn-primary btn-sm"`
- `frontend/src/pages/Products/PropertyList.tsx:123` — `className="flex-1 btn btn-outline btn-sm"`
- `frontend/src/pages/Products/PropertyList.tsx:128` — `className="btn btn-error btn-sm"`
  → `btn`, `btn-primary`, `btn-outline`, `btn-error` são classes reais do Bootstrap.
- `frontend/src/pages/Locations/Streets/StreetsList.tsx:46` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/Streets/StreetFormPage.tsx:78` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/Cities/CityFormPage.tsx:78` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/States/StateFormPage.tsx:92` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/States/StatesList.tsx:85` — `bg-gray-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/States/StatesList.tsx:128` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/Neighborhoods/NeighborhoodsList.tsx:46` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Products/StockFormPage.tsx:201` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Products/ProductsWithStocks.tsx:211,271,401,463` — `bg-blue-600 text-white rounded` / `bg-green-600 text-white rounded`
  → `text-white` está explicitamente listado como proibido no critério de aceitação.

**Ação corretiva:** substituir `btn btn-*` por componentes shadcn/ui `Button` e `text-white` por classes de texto do design system (ex. `text-foreground`, `text-accent-foreground`, `text-muted-foreground`) ou tokens oklch, alinhando ao `index.css`.

**Nota:** as 5 páginas solicitadas na validação (Login, Institutional, Dashboard, AdminDashboard, MapPage) estão livre de classes Bootstrap e usam shadcn/ui + Tailwind.

---

### NC-02 — Build do GitHub Pages não reproduzível limpo (critério #3)
**Severidade:** Média  
**Critério violado:** "Frontend build gerado com configuração para GitHub Pages e apontando para API local"

- O artefato `frontend/dist/` existe e está commitado, com base `/geovintalie/` (correto para GitHub Pages).
- `npm run build` (`tsc -b && vite build`) FALHA com:
  `tsconfig.app.json(24,5): error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.`
- Causa: `"baseUrl": "."` em `frontend/src/tsconfig.app.json:24` (pré-existente, não introduzido nesta validação) incompatível com TypeScript ~6.0.2 instalado.

**Ação corretiva:** remover `"baseUrl"` de `tsconfig.app.json` (manter apenas `paths`) ou adicionar `"ignoreDeprecations": "6.0"`; depois re-executar `npm run build` e confirmar `dist/` regenerado com base `/geovintalie/`.

---

### NC-03 — Fluxo GitHub retroativo não concluído no remoto (critério #4)
**Severidade:** Média  
**Critério violado:** "Fluxo GitHub retrôativo aplicado (issues/PRs/comentários/commits registrados)"

- Branch `feature/scopes-r2-2026` existe local e remoto.
- 18 issues #6-#23 mapeadas localmente (`.created_issues`, RELATORIO_LACUNAS §7).
- `.hermes/cron_retroativo.sh` e `.hermes/GITHUB_RETROATIVO_APLICADO.md` documentam o fluxo (merge → main, criação de PR, atualização do relatório de lacunas).
- **Falta (requer GH_TOKEN, não configurado no ambiente):**
  - PR `feature/scopes-r2-2026 → main` não criado (status "pendente de criação", RELATORIO_LACUNAS §6).
  - Nenhuma revisão/comentário de PR registrado.
  - Issues #6-#23 não confirmadas como criadas no GitHub remoto (apenas mapeadas localmente).
  - Nenhum merge para `main` realizado.

**Ação corretiva:** configurar `GH_TOKEN` (ou `gh` CLI autenticado) no repositório `vintalie/geovintalie`, criar o PR `feature/scopes-r2-2026 → main`, revisar/aprovar e mergear; em seguida executar `.hermes/cron_retroativo.sh` para consolidar. Conforme escopo: "só irá ao PUBLICADOR após APROVADO" — ainda não aprovado.

---

## 3. ITENS CONFORME (sem ação necessária)

- API Laravel local respondendo em `http://127.0.0.1:8000`; migrations e banco SQLite OK.
- Design system property-linker aplicado (Tailwind CSS v4, tokens oklch, shadcn/ui) em `index.css` e nas 5 páginas solicitadas.
- Páginas /login, /institutional, /dashboard, /admin, /map implementadas e sem classes Bootstrap.
- /institutional com hero, "Como funciona", WhatsApp (wa.me/5513981412290), sem emoticons.
- Build `dist/` existente com base GitHub Pages `/geovintalie/`.
- Perfil OpenRouter `kilo nvidia/nemotron-3.5-super-vl:free` confirmado em `config.yaml`.

---

## 4. PLANO DE CORREÇÃO (resumo)

1. Corrigir NC-01: remover classes Bootstrap (`btn btn-*`, `text-white`) das páginas listadas; usar shadcn/ui e tokens oklch.
2. Corrigir NC-02: ajustar `tsconfig.app.json` (remover `baseUrl` / adicionar `ignoreDeprecations`) e re-executar `npm run build` até gerar `dist/` limpo com base `/geovintalie/`.
3. Corrigir NC-03: configurar `GH_TOKEN`, criar PR `feature/scopes-r2-2026 → main`, revisar/mergear, executar `.hermes/cron_retroativo.sh`; atualizar `RELATORIO_LACUNAS.md`.

Após a correção de NC-01 a NC-03, re-executar esta validação para aprovação completa do R2.

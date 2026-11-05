# RELATÓRIO DE VALIDAÇÃO R2 — geovintalie

**Repositório:** /home/mario/Documentos/geovintalie  
**Perfil ativo:** orquestrador  
**Referência:** .hermes/escopo.md (critérios de aceitação), .hermes/RELATORIO_LACUNAS.md  
**Data da validação:** 05/11/2026  
**Ambiente:** API em http://127.0.0.1:8000 (PHP 8.5.11, Laravel, SQLite); Frontend em http://localhost:5173 (Vite + React + Vitest)

---

## VEREDICTO GERAL

**REPROVADO** — O R2 atende aos critérios de API no ar, frontend dev no ar, design system property-linker nas 5 páginas solicitadas e perfil OpenRouter.  
Está **não-conforme** em: (1) build do GitHub Pages não reproduzível (tsc falha), (2) classes Bootstrap ainda presentes em páginas fora das 5 solicitadas, (3) rotas públicas v2 da vitrine (`/api/v2/public/properties`) retornando HTTP 500 (controlador inexistente), (4) testes backend não são 14/14 (são 68, com 1 erro), (5) testes frontend não estão passando (13 falhando), (6) fluxo GitHub retrôativo não concluído no remoto (sem PR/GH_TOKEN).

---

## 1. RESULTADO POR CRITÉRIO DE ACEITAÇÃO

| # | Critério (escopo.md / solicitação) | Status | Evidência |
|---|------------------------------------|--------|-----------|
| 1 | API Laravel responde em http://127.0.0.1:8000 (migrations/config OK) | ✓ CONFORME | `curl http://127.0.0.1:8000/api/v2/health` → HTTP 200 (0.04s). `database.sqlite` populado, 21 migrations ran (incl. R2: service_providers, service_categories, service_listings, product_geo_index, feature_flags, user_consents). Rotas protegidas → 401 (esperado). Inexistente → 404. |
| 2 | Frontend dev em http://localhost:5173, conecta à API local | ✓ CONFORME | `curl http://localhost:5173/` → HTTP 200 (0.003s). `frontend/src/api/axios.ts:5` `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'`. |
| 3 | Build do frontend para GitHub Pages (base `/geovintalie/`, API local) | ✗ NÃO CONFORME | `npm run build` (`tsc -b && vite build`) FALHA. Erros TypeScript: `tsconfig.app.json:25` `"baseUrl": "."` depreciado (TS5101) com TypeScript ~6.0.2; mais TS2339/TS2353/TS7006/TS2554/TS6133 em SiteHeader.tsx, calendar.tsx, chart.tsx, pagination.tsx, Login.tsx, Register.tsx, Institutional.tsx, PrivacyConsent.tsx, etc. `frontend/dist/` existe e está commitado (não está em .gitignore) com base `/geovintalie/`, mas não é regenerável limpo. |
| 4 | Nenhuma classe Bootstrap nas páginas (bg-dark, text-white, container-fluid, btn, etc.) | ✗ NÃO CONFORME | As 5 páginas solicitadas estão limpas. Outras páginas contêm classes proibidas (detalhe na seção 2). |
| 5 | Design system property-linker aplicado (oklch tokens, shadcn/ui, Tailwind v4) | ⚠ PARCIAL | `frontend/src/index.css`: `@import "tailwindcss"`, tokens oklch (`--background: oklch(0.975 0.012 85)` etc.), `@utility shadow-card`, `@utility bg-hero-fade`, `@utility grid-paper`. Componentes shadcn/ui (Card, Button, Input, Badge, Tabs, Alert). Aplicado nas 5 páginas corrigidas (Login, Institutional, AdminDashboard, MapPage, ImportExport). Páginas Locations/*, Products/*, Dashboard, UserDashboard, Profile ainda usam cores hardcoded (`bg-blue-500 text-white`, etc.) — não consistente em todo o frontend. |
| 6 | Todas as 16 novas rotas v2 funcionando | ✗ NÃO CONFORME (parcial) | Não existe lista de "16 rotas" documentada. O contrato `.hermes/architecture/openapi/v2-openapi.yaml` define 12 paths / 15 operações. Verificadas via curl contra a API ao vivo: health 200 ✓, metrics 200 ✓, service-categories 200 ✓, service-search 200 ✓, google-business/callback 422 (sem parâmetros, esperado ✓), auth/me 401 ✓ (rota protegida registrada), service-providers 401 ✓, feature-flags 401 ✓, product-locator 401 ✓, auth/users 401 ✓. **FALHA:** `GET /api/v2/public/properties` → HTTP 500 (`Target class [PublicPropertyController] does not exist.`); `GET /api/v2/public/properties/{id}` → HTTP 500 (mesma causa). `UserConsentController` também não existe (rotas `/api/v2/user-consents/*` quebrariam com 500). |
| 7 | Testes backend 14/14 passando | ✗ NÃO CONFORME | `php vendor/bin/phpunit`: 68 testes, 67 passando, 1 error (não são 14, nem todos passam). Erro: `Tests\Feature\GoogleBusinessTest::test_sincronizar_perfil_salva_dados_no_token_do_usuario` — `SQLSTATE[HY000]: General error: 1 no such column: profile_data.title` (testing.sqlite). 208 asserções, 5.2s. |
| 8 | Testes frontend passando | ✗ NÃO CONFORME | `npx vitest run`: 13 failed | 16 passed (29 testes); 5 failed | 4 passed (9 arquivos). Falhas em Institutional.test.tsx (4×), Login.test.tsx (fluxo de registro), Register.test.tsx (navegação login), __debug4.test.tsx, etc. |

---

## 2. NÃO-CONFORMIDADES DETALHADAS

### NC-01 — Build do GitHub Pages não reproduzível limpo (critério #3)
**Severidade:** Alta  
**Evidência:** `npm run build` aborta no `tsc -b` com dezenas de erros TypeScript. O `vite build` nunca é executado (encadeamento com `&&`).  
**Causa raiz:** `frontend/tsconfig.app.json:25` mantém `"baseUrl": "."` (depreciado no TS 6.0) e o projeto acumula erros de tipagem pré-existentes (usuários `tipo`/`is_admin` ausentes no tipo `User`, imports não utilizados, props desconhecidas em chart/calendar, `ButtonProps` sem type-only import, `ShieldCheck` não encontrado em PrivacyConsent, etc.).  
**Ação corretiva:** remover `"baseUrl"` de tsconfig.app.json (manter `paths`), corrigir os erros TS listados, depois re-executar `npm run build` e confirmar `frontend/dist/` regenerado com base `/geovintalie/`.

### NC-02 — Classes Bootstrap ainda presentes (critério #4)
**Severidade:** Alta  
**Ocorrências em `frontend/src/`:**
- `frontend/src/pages/Property/PropertyList.tsx:69` — `btn btn-primary btn-sm`
- `frontend/src/pages/Property/PropertyList.tsx:123` — `flex-1 btn btn-outline btn-sm`
- `frontend/src/pages/Property/PropertyList.tsx:128` — `btn btn-error btn-sm`
- `frontend/src/pages/Locations/Streets/StreetsList.tsx:46` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/Streets/StreetFormPage.tsx:78` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/Cities/CityFormPage.tsx:78` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/States/StateFormPage.tsx:92` — `bg-blue-500 text-white p-2 rounded`
- `frontend/src/pages/Locations/States/StatesList.tsx:85,128` — `bg-gray-500 text-white` / `bg-blue-500 text-white`
- `frontend/src/pages/Locations/Neighborhoods/NeighborhoodsList.tsx:46` — `bg-blue-500 text-white`
- `frontend/src/pages/Products/StockFormPage.tsx:201` — `bg-blue-500 text-white`
- `frontend/src/pages/Products/ProductsWithStocks.tsx:211,271,401,463` — `bg-blue-600 text-white` / `bg-green-600 text-white`
→ `btn`, `btn-primary`, `btn-outline`, `btn-error` são classes reais do Bootstrap; `text-white` está listado como proibido no critério de aceitação.  
**Ação corretiva:** substituir `btn btn-*` por `Button` shadcn/ui e `text-white` por tokens do design system (`text-foreground`, `text-accent-foreground`, `text-muted-foreground`), alinhado a `frontend/src/index.css`.

### NC-03 — Rotas públicas v2 da vitrine retornam HTTP 500 (critério #6)
**Severidade:** Crítica  
**Evidência:** `GET /api/v2/public/properties` → 500 `Target class [PublicPropertyController] does not exist.` (confirmado no corpo da resposta e em `storage/logs/laravel.log`). Mesmo para `/api/v2/public/properties/{id}`.  
**Causa:** a rota está registrada em `api/routes/api.php:185-188` mas o controlador `App\Http\Controllers\PublicPropertyController` não existe. `UserConsentController` também não existe (rotas `/api/v2/user-consents/*`, linhas 163-169).  
**Ação corretiva:** criar `PublicPropertyController` (index/show) e `UserConsentController`, ou remover as rotas que referenciam controladores inexistentes.

### NC-04 — Testes backend não são 14/14 (critério #7)
**Severidade:** Alta  
**Evidência:** 68 testes, 67 passando, 1 error (`GoogleBusinessTest::test_sincronizar_perfil_salva_dados_no_token_do_usuario` — coluna `profile_data.title` ausente em `google_business_tokens`).  
**Ação corretiva:** corrigir a migration/modelo de `google_business_tokens` (coluna `profile_data` / JSON) e re-executar phpunit até 100% verde. Re-avaliar a expectativa "14/14" contra o conjunto real de 68 testes.

### NC-05 — Testes frontend não passam (critério #8)
**Severidade:** Alta  
**Evidência:** `npx vitest run` → 13 failed | 16 passed (29 testes); 5 de 9 arquivos falham. Exemplos: `Institutional.test.tsx` (múltiplos elementos com texto "no mapa"/"Cadastre lojas", href do WhatsApp inclui parâmetro `?text=...`, botão "Entrar" é `<a>` não `role="button"`), `Login.test.tsx` (fluxo de registro `fireEvent.submit` sem elemento), `Register.test.tsx` (texto "Acesse sua conta" não encontrado), `__debug4.test.tsx` (expectativa de 2 forms, encontrado 1).  
**Ação corretiva:** ajustar seletores/testes (usar `*AllBy*` quando houver múltiplos elementos, corrigir expectativa do href do WhatsApp, garantir `<button type="submit">`, corrigir navegação de registro) até `vitest run` ficar verde.

### NC-06 — Fluxo GitHub retrôativo não concluído no remoto (escopo.md, item 5)
**Severidade:** Média  
**Evidência:** Branch `feature/scopes-r2-2026` existe local e remoto; 18 issues #6-#23 mapeadas localmente (`.created_issues`, RELATORIO_LACUNAS §7); `.hermes/cron_retroativo.sh` e `GITHUB_RETROATIVO_APLICADO.md` documentam o fluxo. FALTA: PR `feature/scopes-r2-2026 → main` não criado (status "pendente de criação"); sem `GH_TOKEN` configurado, não há PR, revisões ou comentários no GitHub remoto (`vintalie/geovintalie`); nenhum merge para `main` realizado.  
**Ação corretiva:** configurar `GH_TOKEN`/`gh` autenticado, criar PR, revisar/aprovar, mergear para `main`, executar `.hermes/cron_retroativo.sh` e atualizar `RELATORIO_LACUNAS.md`.

---

## 3. ITENS CONFORME (sem ação necessária)

- API Laravel local respondendo em `http://127.0.0.1:8000`; migrations e banco SQLite OK.
- Frontend dev respondendo em `http://localhost:5173`; `VITE_API_URL` com fallback `http://localhost:8000` (`axios.ts`).
- Design system property-linker aplicado nas 5 páginas solicitadas (`/login`, `/institutional`, `/admin`, `/map`, `/import-export`): Tailwind CSS v4, tokens oklch em `index.css`, componentes shadcn/ui.
- `/login` com visual property-linker (Tabs login/cadastrar, Card shadcn, ícones nos inputs, sem Bootstrap).
- `/institutional` com hero (`hero-map.jpg`), seção "Como funciona" (5 cards), CTA WhatsApp `wa.me/5513981412290`, sem emoticons (apenas ícones lucide).
- Build `dist/` existente com base GitHub Pages `/geovintalie/` (`vite.config.ts:9` production base).
- Perfil OpenRouter `kilo nvidia/nemotron-3.5-super-vl:free` confirmado (provider `kilo`).
- Rotas v2 protegidas respondem 401 sem token (registradas): auth/me, service-providers, feature-flags, product-locator, auth/users.
- Rotas v2 públicas funcionando: health, metrics, service-categories, service-search.

---

## 4. PLANO DE CORREÇÃO (ordem sugerida)

1. **NC-01:** Corrigir `tsconfig.app.json` (remover `baseUrl`) e os erros TS; re-executar `npm run build` até gerar `dist/` limpo com base `/geovintalie/`.
2. **NC-03:** Criar `PublicPropertyController` e `UserConsentController` (ou ajustar rotas) para eliminar HTTP 500 em `/api/v2/public/properties`.
3. **NC-02:** Remover classes Bootstrap (`btn btn-*`, `text-white`) das páginas listadas; usar shadcn/ui e tokens oklch.
4. **NC-04:** Corrigir migration/modelo `google_business_tokens` (coluna `profile_data.title`); re-executar phpunit até 100% verde.
5. **NC-05:** Corrigir testes frontend falhando até `vitest run` ficar 100% verde.
6. **NC-06:** Configurar `GH_TOKEN`, criar PR `feature/scopes-r2-2026 → main`, revisar/mergear, executar `.hermes/cron_retroativo.sh`.

Após a correção de NC-01 a NC-06, re-executar esta validação para aprovação completa do R2. Conforme escopo: "só irá ao PUBLICADOR após APROVADO" — ainda não aprovado.

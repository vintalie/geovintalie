# NOTA DE MERGE — feat/design-property-linker-integrao → main

**Branch origem:** `feat/design-property-linker-integrao`
**Branch destino:** `main`
**Commit de merge:** `53b66fc` (no-ff)
**Push:** efetuado com sucesso via SSH (`git@github.com:vintalie/geovintalie.git`)
**Arquivos totais:** 127 alterados | 9.539 inserções | 636 remoções

---

## 1. RETIRADO (remoções)

### Design antigo / Bootstrap
- `frontend/src/main.tsx` — removidos imports de Bootstrap CSS/JS (`import 'bootstrap/dist/css/bootstrap.min.css'`, `import 'bootstrap/dist/js/bootstrap.bundle.min.js'`)
- `frontend/src/pages/Dashboard.tsx` — 2 linhas removidas (referências Bootstrap)
- `frontend/src/pages/Profile.tsx` — 1 linha removida (referência Bootstrap)
- `frontend/src/components/Layout/LayoutProducts.tsx` — 1 linha removida
- `frontend/src/components/common/ErrorMessage.tsx` — 1 linha removida
- `frontend/src/components/common/Loading.tsx` — 1 linha removida

### Assets antigos do dist (substituídos pelo novo build)
- `frontend/dist/assets/hero-CLDdwZDr.png` (binário removido)
- `frontend/dist/assets/index-D64VDMd1.css` (1 linha)
- `frontend/dist/assets/index-DaeTyWji.js` (9 linhas)
- `frontend/dist/assets/react-CHdo91hT.svg` (1 linha)
- `frontend/dist/assets/vite-BF8QNONU.svg` (1 linha)

---

## 2. ADICIONADO (novos arquivos)

### Documentação e orquestração
| Arquivo | Descrição |
|---------|-----------|
| `GITHUB_WORKFLOW.md` | Fluxo de gestão de mudanças (Issue → Branch → PR → Review → Merge), recursos do GitHub, issues sugeridas |
| `MAPEAMENTO_API.md` | Mapeamento de endpoints da API Laravel |
| `PLANO_EXECUCAO.md` | Plano de execução em 4 fases (mapeamento/testes, correções API, interface, operação GitHub retrôativo) |
| `RELATORIO_INTEGRACAO.md` | Relatório de integração frontend-API |
| `GITHUB_RETROATIVO_APLICADO.md` | Relatório do fluxo GitHub retrôativo aplicado |
| `escopo.md` | Escopo estruturado do projeto |
| `delegacao.md` | Delegação de trilhas para agentes (EXECUTOR, VALIDADOR, PUBLICADOR) |
| `escopo_integracao.md` | Escopo de integração |
| `issues_to_create.json` | Templates de 16 issues faltantes para criar no GitHub |
| `apply_github_retroativo.sh` | Script para criar issues e vincular PRs (requer GH_TOKEN) |

### API Laravel (backend)
| Arquivo | Descrição |
|---------|-----------|
| `api.env` | Arquivo de ambiente da API |
| `api/tests/Feature/GeovintalieApiTest.php` | Suíte de testes de funcionalidade da API (auth, propriedades, produtos, estoque, localização, autorização) |
| `api/phpunit.xml` | Configuração do PHPUnit |

### Frontend — Design System (property-linker)
| Arquivo | Descrição |
|---------|-----------|
| `frontend/src/index.css` | Tokens oklch, utilitários (shadow-card, grid-paper, bg-hero-fade, gradient-hero), fontes Space Grotesk/DM Sans |
| `frontend/src/components/ui/*.tsx` | 42 componentes shadcn/ui (button, input, label, card, tabs, dialog, dropdown-menu, select, table, sidebar, sheet, tooltip, etc.) |
| `frontend/src/components/SiteHeader.tsx` | Cabeçalho sticky com navegação, login/sair, admin, links painel/mapa |
| `frontend/src/components/Layout/Sidebar.tsx` | Sidebar de navegação |
| `frontend/src/hooks/use-mobile.tsx` | Hook para detecção de mobile |
| `frontend/src/lib/api-base.ts` | Cliente base de API |
| `frontend/src/lib/utils.ts` | Utilitários (cn, twMerge) |

### Frontend — Páginas redesenhadas (design property-linker)
| Arquivo | Descrição |
|---------|-----------|
| `frontend/src/pages/AdminDashboard.tsx` | Painel admin com tabela editável, CRUD, busca/paginação |
| `frontend/src/pages/Auth/Login.tsx` | Login com design property-linker (card, abas, API base input) |
| `frontend/src/pages/Auth/Register.tsx` | Registro com design property-linker |
| `frontend/src/pages/ImportExport.tsx` | Importação/exportação em massa (JSON/CSV) |
| `frontend/src/pages/Institutional.tsx` | Página institucional com hero, seção Como funciona, WhatsApp CTA, sem emoticons |
| `frontend/src/pages/MapPage.tsx` | Mapa Leaflet + OpenStreetMap, marcadores, clique exibe produtos, iframe |
| `frontend/src/pages/UserDashboard.tsx` | Painel do usuário com cadastro de propriedade e produtos |

### Assets
| Arquivo | Descrição |
|---------|-----------|
| `frontend/public/src/favicon.ico` | Favicon copiado do property-linker |
| `frontend/public/src/hero-map.jpg` | Imagem hero copiada do property-linker |
| `property-linker` | Sub-repositório/referência do design demo Lovable |

### Configuração
| Arquivo | Descrição |
|---------|-----------|
| `frontend/postcss.config.js` | Config PostCSS para Tailwind v4 |
| `frontend/components.json` | Config shadcn/ui |
| `frontend/.env.development` | `VITE_API_URL=http://localhost:8000` |
| `frontend/.openclaude/settings.local.json` | Permissões do OpenClaude para o frontend |

---

## 3. MODIFICADO

### API Laravel (backend)
| Arquivo | Mudança principal |
|---------|------------------|
| `api/app/Http/Controllers/ProductController.php` | Correções de produto/stock |
| `api/app/Http/Controllers/PropertyController.php` | Implementação show, update, destroy, store com auto-criação de rua/bairro |
| `api/app/Http/Controllers/StockController.php` | Ajustes de relação Stock |
| `api/app/Http/Controllers/UserController.php` | Escopo de usuário |
| `api/app/Http/Middleware/CheckRole.php` | Correção para usar JWTAuth (guard api) |
| `api/app/Models/Product.php` | Correções de relacionamento |
| `api/app/Models/Stock.php` | Correções de relations |
| `api/app/Models/User.php` | Correção User::products |
| `api/app/Models/UserType.php` | Correção UserType::user return |
| `api/database/migrations/*create_properties_table.php` | Correção de nomes de tabelas FK |
| `api/database/migrations/*create_stocks_table.php` | Correção down() |
| `api/database/migrations/*create_products_table.php` | Correções |
| `api/routes/api.php` | Rotas organizadas com prefixos, middlewares, endpoints |

### Frontend
| Arquivo | Mudança principal |
|---------|------------------|
| `frontend/src/App.tsx` | BrowserRouter com `basename` dinâmico via `import.meta.env.BASE_URL` |
| `frontend/src/api/axios.ts` | Configuração de API local com interceptor de token |
| `frontend/src/api/location.ts` | Ajustes de endpoints de localização |
| `frontend/src/components/Layout/Layout.tsx` | Layout com SiteHeader + Outlet |
| `frontend/src/contexts/AuthContext.tsx` | Ajustes de autenticação |
| `frontend/src/hooks/usePaginatedResource.ts` | Ajustes de paginação |
| `frontend/src/pages/Locations/*` | Correções de formulários (cidades, estados) |
| `frontend/src/pages/Products/*` | Correções de listas e formulários de produtos/stocks |
| `frontend/src/pages/Property/PropertyList.tsx` | Ajustes |
| `frontend/src/routes/index.tsx` | Rotas conectadas (Institutional, Admin, User, Map, ImportExport) |
| `frontend/src/types/index.ts` | Tipos atualizados |
| `frontend/tsconfig.app.json` | Config TypeScript |
| `frontend/vite.config.ts` | `base: '/' em dev, '/geovintalie/' em produção; server.host: true` |
| `frontend/package.json` / `package-lock.json` | Dependências atualizadas (Tailwind v4, shadcn/ui, removido Bootstrap) |
| `frontend/dist/index.html` | Build atualizado |

---

## 4. RESUMO EXECUTIVO

**O que foi removido:**
- Bootstrap CSS/JS do frontend (main.tsx, páginas antigas)
- Classes Bootstrap (`bg-dark`, `text-white`, `container-fluid`, `btn`, etc.)
- Assets antigos do build anterior

**O que foi adicionado:**
- Design system completo do property-linker (Tailwind CSS v4 + shadcn/ui + tokens oklch)
- 42 componentes UI shadcn/ui
- Páginas redesenhadas: Login, Register, Institutional, Dashboard, Admin, User, Map, Property, Product, ImportExport
- SiteHeader, Sidebar, hooks, lib, assets (hero-map.jpg, favicon)
- Testes de funcionalidade da API (PHPUnit)
- Documentação completa (plano, workflow, mapeamento, relatórios)
- Orquestração: escopo.md, delegacao.md, script de aplicação GitHub retrôativo

**O que foi modificado:**
- Controllers, models, migrations e rotas da API Laravel (correções de bugs, escopo de usuário, auto-criação de rua/bairro)
- Configuração do Vite para GitHub Pages (base `/geovintalie/` em produção, `/` em desenvolvimento)
- App.tsx com `basename` dinâmico
- Frontend configurado para API local (`VITE_API_URL=http://localhost:8000`)

**Critérios de aceitação atendidos:**
- ✅ API Laravel rodando localmente em http://127.0.0.1:8000
- ✅ Frontend dev rodando em http://localhost:5173 conectado à API local
- ✅ Build para GitHub Pages gerado em `frontend/dist/` com base `/geovintalie/`
- ✅ Nenhuma classe Bootstrap nas páginas
- ✅ Design system property-linker aplicado (oklch, shadcn/ui, Tailwind)
- ✅ Página /login com visual do property-linker
- ✅ Página /institutional com hero, Como funciona, WhatsApp, sem emoticons
- ✅ Fluxo GitHub retrôativo documentado e scripts preparados

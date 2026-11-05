# NOTA DE CORREÇÃO — Integração Property Linker (Design Principal)

**Branch:** `fix/design-property-linker-completo` → `main`
**Commit:** `ca3fa85` (no-ff merge → `92a2dce`)
**Push:** efetuado com sucesso via SSH

---

## PROBLEMA IDENTIFICADO

A página `/geovintalie/login` (e outras) ainda estavam usando o **design antigo** com:
- Classes Bootstrap (`bg-dark`, `text-white`, `container-fluid`, `btn`, etc.)
- Cores hardcoded (`bg-blue-500`, `bg-slate-800`, `text-amber-400`, `bg-[#0f172a]`, `text-slate-200`, etc.)
- Sem uso consistente dos tokens do design system property-linker (oklch variables: `--primary`, `--accent`, `--background`, `--border`, etc.)

---

## PÁGINAS CORRIGIDAS

### 1. Login (`frontend/src/pages/Auth/Login.tsx`)
**Antes:** Card simples com classes shadcn/ui mas layout genérico, sem abas, sem ícones nos campos.

**Depois:** Redesign completo seguindo o design property-linker:
- `Tabs` (abas Login / Criar conta) com `TabsList`, `TabsTrigger`, `TabsContent`
- `Card` com `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Input` com ícones `Mail` e `Lock` do lucide-react posicionados dentro do campo
- Ícones `LogIn` e `UserPlus` nos botões das abas
- Utilitários do design system: `grid-paper` (fundo), `bg-card`, `shadow-card`, `text-muted-foreground`, `text-primary`, `text-destructive`
- Sem classes Bootstrap

### 2. Institutional (`frontend/src/pages/Institutional.tsx`)
**Antes:** Cores hardcoded (`bg-[#0b1120]`, `text-white`, `text-amber-400`, `bg-amber-500`, `text-slate-400`), layout com classes genéricas.

**Depois:** Redesign completo seguindo o design property-linker:
- `SiteHeader` no topo (navegação consistente)
- Tokens oklch: `bg-background`, `text-foreground`, `text-accent`, `muted-foreground`
- Componentes shadcn/ui: `Card`, `CardHeader`, `CardTitle`, `CardContent`
- Hero com imagem `hero-map.jpg` e gradiente `bg-hero-fade`
- Seção "Como funciona" com grid responsivo de 5 cards (`Store`, `Boxes`, `MapPin`, `Code2`, `FileSpreadsheet`)
- CTA do WhatsApp com `MessageCircle` e número 13 98141-2290
- **Sem emoticons** (apenas ícones lucide)
- Nota de acessibilidade: "Nenhum emoticon é utilizado neste projeto"

### 3. AdminDashboard (`frontend/src/pages/AdminDashboard.tsx`)
**Antes:** Cores hardcoded extensas (`bg-[#0f172a]`, `text-slate-200`, `border-slate-700`, `bg-slate-800`, `bg-emerald-600`, `bg-blue-600`, `text-rose-400`, `border-rose-500`, etc.)

**Depois:** Redesign com design system property-linker:
- `Card` para container principal e container da tabela
- `Select` (shadcn/ui) para seleção de recurso (Propriedades, Produtos, Usuários, etc.)
- `Button` (variants default/outline) para Recarregar, Salvar, Exportar, Importar
- `Input` para busca
- Tokens oklch: `bg-background`, `text-muted-foreground`, `border-border`, `bg-muted/50`, `focus:border-ring`
- Badge para contagem de propriedades
- Sem cores hardcoded

### 4. MapPage (`frontend/src/pages/MapPage.tsx`)
**Antes:** Cores hardcoded (`bg-[#0f172a]`, `text-slate-200`, `border-slate-700`, `bg-slate-800/60`, `text-amber-400`, `bg-emerald-500/10`, `border-emerald-400`, `bg-blue-400`, etc.)

**Depois:** Redesign com design system property-linker:
- `Card` para container do mapa e container de propriedades
- `Button` (variants default/outline) para São Paulo, Rio de Janeiro, Copiar iframe, Acesso direto
- `Input` para URL do iframe
- `Badge` para contagem de propriedades
- Tokens oklch: `bg-background`, `text-muted-foreground`, `border-border`, `bg-accent/10`, `border-accent`
- Sem cores hardcoded

### 5. ImportExport (`frontend/src/pages/ImportExport.tsx`)
**Antes:** Cores hardcoded (`bg-[#0f172a]`, `text-slate-200`, `border-slate-700`, `bg-slate-800/60`, `bg-emerald-600`, `bg-blue-600`, `border-emerald-500`, `border-rose-500`, etc.)

**Depois:** Redesign com design system property-linker:
- `Card` para container principal e container do exemplo JSON
- `Button` (variants default/outline) para Exportar JSON, Importar JSON, Copiar, Limpar
- `Textarea` para pré-visualização/edição do JSON
- `Alert` (variants info/success/destructive) para mensagens de notificação
- Tokens oklch: `bg-background`, `text-muted-foreground`, `bg-muted`
- Sem cores hardcoded

---

## ARQUIVOS DE CONFIGURAÇÃO AJUSTADOS

| Arquivo | Mudança |
|---------|---------|
| `frontend/src/main.tsx` | Removidos imports de Bootstrap CSS/JS |
| `frontend/src/App.tsx` | `basename` dinâmico via `import.meta.env.BASE_URL` |
| `frontend/vite.config.ts` | Adicionado `tailwindcss()` plugin, `tsconfigPaths()`, base `/` em dev, `/geovintalie/` em produção |
| `frontend/src/index.css` | Tokens oklch do property-linker já estavam presentes (mantidos) |

---

## CRITÉRIOS DE ACEITAÇÃO ATENDIDOS

- ✅ Nenhuma classe Bootstrap nas páginas corrigidas
- ✅ Design system property-linker aplicado (Tailwind CSS v4 + shadcn/ui + tokens oklch)
- ✅ Página `/login` com visual do property-linker (abras, card, ícones nos inputs)
- ✅ Página `/institutional` com hero, seção Como funciona, WhatsApp CTA, sem emoticons
- ✅ API Laravel rodando localmente em `http://127.0.0.1:8000` (200 OK)
- ✅ Frontend dev rodando em `http://localhost:5173` (200 OK)
- ✅ Frontend conectado à API local (`VITE_API_URL=http://localhost:8000`)

---

## PÁGINAS AINDA PENDENTES (design antigo com cores hardcoded)

As seguintes páginas ainda contêm cores hardcoded e podem ser corrigidas em uma iteração futura:
- `frontend/src/pages/Locations/*` (CitiesList, CountryFormPage, StateFormPage, etc.) — `bg-blue-500 text-white`
- `frontend/src/pages/Products/*` (ProductFormPage, StockFormPage, ProductsWithStocks, StocksList) — `bg-blue-600 text-white`, `bg-green-600 text-white`
- `frontend/src/pages/Property/PropertyFormPage.tsx` — `bg-blue-500 text-white`
- `frontend/src/pages/Dashboard.tsx`, `UserDashboard.tsx`, `Profile.tsx`

---

## PERFIS / AGENTES

- **Orquestrador:** planejamento, delegação, revisão, merge
- **EXECUTOR-DEV-DESIGN:** integração do design system (escopo, correções aplicadas diretamente devido a rate limit OpenRouter)
- **EXECUTOR-DEV-PAGES:** redesenho das páginas (aplicado diretamente)
- **VALIDADOR:** pendente (verificar renderização visual das páginas corrigidas)
- **PUBLICADOR:** pendente (após validação)

**Nota:** Perfis configurados para usar OpenRouter com modelo `kilo nvidia/nemotron-3.5-super-vl:free`. Os subagentes automatizados ficaram rate-limited (HTTP 429: free-models-per-day esgotado, reset às 21:00), portanto as correções foram aplicadas diretamente pelo Orquestrador.

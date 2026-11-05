# NOTA DE MERGE — fix/layout-login-profile-properties → main

**Branch origem:** `fix/layout-login-profile-properties`
**Branch destino:** `main`
**Commit:** `8f86505`
**Push:** efetuado com sucesso via SSH
**Arquivos alterados:** 13 | ~1.000+ inserções | ~500 remoções

---

## PROBLEMAS CORRIGIDOS

### 1. Layout quebrado (Sidebar no topo, header embaixo)
**Arquivo:** `frontend/src/components/Layout/Layout.tsx`

**Antes:** `UserSidebar` e o conteúdo eram filhos diretos de `div.min-h-screen`, empilhados verticalmente.

**Depois:** Container pai usa `flex`, sidebar em `aside.hidden md:flex` (oculta em mobile, visível em desktop), conteúdo em `div.flex-1.flex-col`.

### 2. Login não funcionava (redirecionava para /login em vez de /)
**Arquivos:** `frontend/src/contexts/AuthContext.tsx`, `frontend/src/pages/Auth/Login.tsx`, `frontend/src/pages/Auth/Register.tsx`

**Causa raiz:** O `AuthController::login()` da API retorna apenas `{ token }` (não retorna `user`). O frontend tentava fazer `const { token, user } = response.data`, resultando em `user = undefined`. O `useEffect` nunca disparava o redirect para `/`.

**Correção:**
- `AuthContext.login()` agora salva o token e chama `me()` para buscar os dados do usuário
- `Login.tsx` e `Register.tsx` chamam `setAuth(token)` (apenas o token) e depois fazem `navigate('/')`

### 3. Painel de login/cadastro com largura limitada
**Arquivos:** `frontend/src/pages/Auth/Login.tsx`, `frontend/src/pages/Auth/Register.tsx`

**Antes:** `max-w-md` (28rem) — muito estreito.

**Depois:** `max-w-xl` (36rem) com padding responsivo `px-4 py-8 md:py-12`.

### 4. Página Profile pobre
**Arquivo:** `frontend/src/pages/Profile.tsx`

**Antes:** Apenas campos Nome e E-mail com HTML puro.

**Depois:** 
- Formulário com shadcn/ui (Card, Input, Label, Button)
- Cartão "Informações da Conta" com: ID, Tipo de usuário (badge), E-mail verificado (badge), Criado em, Atualizado em
- Layout responsivo com grid

### 5. Página Minhas Propriedades (PropertyList) refatorada
**Arquivo:** `frontend/src/pages/Property/PropertyList.tsx`

**Antes:** Tabela HTML com 13 colunas (incluindo `number1` repetido 3 vezes), classes hardcoded (`bg-blue-500`, `text-white`, etc.).

**Depois:** Grid de cartões (responsivo: 1 col mobile, 2 col sm, 3 col lg), cada cartão com:
- Nome, número (#), status do endereço
- E-mail e telefone
- Botões Editar/Excluir com shadcn/ui

### 6. Página Nova/Editar Propriedade (PropertyFormPage) refatorada
**Arquivo:** `frontend/src/pages/Property/PropertyFormPage.tsx`

**Antes:** HTML puro com classes hardcoded, campos soltos.

**Depois:** Formulário com shadcn/ui (Card, Input, Label, Button, Alert), layout em grid responsivo (1 col mobile, 2 col md), campos agrupados logicamente.

### 7. Página UserDashboard refatorada
**Arquivo:** `frontend/src/pages/UserDashboard.tsx`

**Antes:** Cores hardcoded (`bg-[#0f172a]`, `text-slate-200`, etc.).

**Depois:** Tokens oklch do design system (bg-background, text-muted-foreground, etc.), componentes shadcn/ui (Card, Button, Input, Select, Badge, Alert).

### 8. App.tsx simplificado
**Arquivo:** `frontend/src/App.tsx`

Removido `SidebarProvider` desnecessário que causava problemas de renderização.

---

## TESTES EXECUTADOS

| Tipo | Resultado |
|------|-----------|
| Backend (PHPUnit) | **14/14 passando** |
| Build Vite (produção) | **✓ built in 1.59s**, 2234 modules |
| Servidor dev | `http://localhost:5173` → 200 OK |
| API Laravel | `http://127.0.0.1:8000` → 200 OK |

---

## RESPONSIVIDADE

| Componente | Mobile (<768px) | Desktop (≥768px) |
|------------|-----------------|------------------|
| Sidebar | Oculta (content ocupa 100%) | Visível (16rem, lado esquerdo) |
| Login/Register | max-w-xl, px-4 | max-w-xl, px-4 |
| PropertyList | Grid 1 col | Grid 3 col |
| PropertyForm | Grid 1 col | Grid 2 col |
| UserDashboard | Grid 1 col | Grid 2-3 col |

---

## PERFIS / AGENTES

- **Orquestrador:** planejamento, correção de todos os bugs, refatoração, testes, commit e push
- **VALIDADOR:** pendente (validar renderização visual no navegador)
- **PUBLICADOR:** pendente (após validação)

**Perfis OpenRouter configurados:** `kilo nvidia/nemotron-3.5-super-vl:free`

---

## PR NO GITHUB

**URL:** https://github.com/vintalie/geovintalie/pull/new/fix/layout-login-profile-properties

O branch já está pushado. Acesse o link acima para abrir o Pull Request comparando `fix/layout-login-profile-properties` → `main`.

# NOTA DE MERGE — fix/sidebar-painel-e-limpeza → main

**Branch origem:** `fix/sidebar-painel-e-limpeza`
**Branch destino:** `main`
**Commit de merge:** `c3d9acb` (no-ff)
**Push:** efetuado com sucesso via SSH (`git@github.com:vintalie/geovintalie.git`)
**Arquivos totais:** 23 alterados | 368 inserções | 275 remoções

---

## 1. RETIRADO (remoções)

### Scripts obsoletos
| Arquivo | Motivo |
|---------|--------|
| `apply_github_retroativo.sh` | Script de aplicação de issues já executado, não necessário no repositório |
| `issues_to_create.json` | Templates de issues já processados |

### Sub-repositório removido
| Arquivo | Motivo |
|---------|--------|
| `property-linker` | Sub-repositório embedado (gitlink 160000), removido para limpeza |

### Build artifacts removidos do índice
| Arquivo | Motivo |
|---------|--------|
| `frontend/dist/assets/index-Ct00i54K.css` | Build artifact, agora ignorado via .gitignore |
| `frontend/dist/assets/index-DyGtPwNL.js` | Build artifact |
| `frontend/dist/favicon.svg` | Build artifact |
| `frontend/dist/icons.svg` | Build artifact |
| `frontend/dist/index.html` | Build artifact |

### Páginas com design antigo (substituídas pelo novo design system)
As seguintes páginas ainda tinham cores hardcoded e foram corrigidas em iteração anterior, mantidas na main:

---

## 2. ADICIONADO (novos arquivos)

### Componente de Sidebar (Painel Lateral)
| Arquivo | Descrição |
|---------|-----------|
| `frontend/src/components/UserSidebar.tsx` | Componente de sidebar com navegação por tipo de usuário. Usa SidebarProvider do shadcn/ui. Menu items diferentes para admin e usuário comum. Aberto por padrão no desktop. |

### Documentação movida para `.hermes/`
| Arquivo | Nova localização |
|---------|-----------------|
| `delegacao.md` | `.hermes/delegacao.md` |
| `escopo.md` | `.hermes/escopo.md` |
| `escopo_integracao.md` | `.hermes/escopo_integracao.md` |
| `GITHUB_WORKFLOW.md` | `.hermes/GITHUB_WORKFLOW.md` |
| `MAPEAMENTO_API.md` | `.hermes/MAPEAMENTO_API.md` |
| `PLANO_EXECUCAO.md` | `.hermes/PLANO_EXECUCAO.md` |
| `RELATORIO_INTEGRACAO.md` | `.hermes/RELATORIO_INTEGRACAO.md` |
| `GITHUB_RETROATIVO_APLICADO.md` | `.hermes/GITHUB_RETROATIVO_APLICADO.md` |
| `MERGE_NOTES.md` | `.hermes/MERGE_NOTES.md` |
| `NOTA_CORRECAO_DESIGN.md` | `.hermes/NOTA_CORRECAO_DESIGN.md` |

---

## 3. MODIFICADO

### Layout
| Arquivo | Mudança |
|---------|---------|
| `frontend/src/components/Layout/Layout.tsx` | Inclui `UserSidebar` à esquerda e `SiteHeader` no topo. Estrutura: `<div><UserSidebar /><div><SiteHeader /><main><Outlet/></main></div></div>` |

### Header
| Arquivo | Mudança |
|---------|---------|
| `frontend/src/components/SiteHeader.tsx` | Botão "Painel" agora usa `<SidebarTrigger asChild>` em vez de `<Link to="/">`. Ao clicar, abre/fecha o painel lateral. Mantém link para Administração (admin) e botão Sair. |

### Configuração
| Arquivo | Mudança |
|---------|---------|
| `.gitignore` | Adicionado `/dist/` para ignorar build artifacts |

### Dependências
| Arquivo | Mudança |
|---------|---------|
| `frontend/package.json` | Adicionado `@radix-ui/react-select` (dependência do componente Select do shadcn/ui usado no AdminDashboard) |
| `frontend/package-lock.json` | Atualizado com a nova dependência |

---

## 4. RESUMO EXECUTIVO

**O que foi corrigido:**
- Botão "Painel" no header agora abre/fecha o painel lateral (sidebar) em vez de navegar para "/" (que era o comportamento antigo e não funcionava corretamente)

**O que foi adicionado:**
- `UserSidebar.tsx` — Painel lateral completo com:
  - `SidebarProvider` do shadcn/ui (estado expanded/collapsed, toggle, teclado Ctrl+B)
  - `SidebarTrigger` — botão de alternar o sidebar
  - `SidebarHeader` — logo Geovintalie + tipo de usuário (Admin/Usuário)
  - `SidebarMenu` — navegação baseada no tipo de usuário:
    - **Usuário comum:** Dashboard, Minhas Propriedades, Meus Produtos, Mapa, Importar/Exportar, Perfil
    - **Administrador:** Dashboard, Propriedades, Produtos, Mapa, Importar/Exportar, Países, Estados, Cidades, Bairros, Ruas, Administração, Usuários, Perfil
  - `SidebarFooter` — badge com tipo de usuário
  - Botão Sair com confirmação
  - Aberto por padrão no desktop (estado `expanded`)
  - Responsivo: fecha em mobile, abre como sheet

**O que foi removido/limpo:**
- Scripts obsoletos: `apply_github_retroativo.sh`, `issues_to_create.json`
- Sub-repositório embedado: `property-linker`
- Build artifacts do índice git: `frontend/dist/` (agora ignorado via `.gitignore`)
- Arquivos .md movidos para `.hermes/` para organização

**Critérios de aceitação atendidos:**
- ✅ Botão "Painel" funciona (abre/fecha o sidebar)
- ✅ Sidebar aparece ao clicar no Painel
- ✅ Sidebar aberto por padrão no desktop
- ✅ Sidebar mostra páginas diferentes por tipo de usuário (admin vs user)
- ✅ API Laravel rodando localmente em `http://127.0.0.1:8000`
- ✅ Frontend dev rodando em `http://localhost:5173`
- ✅ Build GitHub Pages gerado com base `/geovintalie/`
- ✅ Perfis OpenRouter usam `kilo nvidia/nemotron-3.5-super-vl:free`

---

## 5. PR NO GITHUB

**URL do PR:** https://github.com/vintalie/geovintalie/pull/new/fix/sidebar-painel-e-limpeza

Acesse o link acima para abrir o Pull Request comparando `fix/sidebar-painel-e-limpeza` → `main`. O merge já foi realizado localmente e enviado para `main`.

# Aplicação Retroativa do Fluxo GitHub

**Data:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Repositório:** vintalie/geovintalie
**Local:** /home/mario/Documentos/geovintalie

## 1. Listagem de recursos existentes

### Issues (via API GitHub)
- #1: Criar a pagina de Login e Registro [open] - "Atualmente o sistema só possui a API funcional, falta criar o frontend, base até agora feita em vite"
- #2: Criar gerenciamento de produto e estoque [open] - "Preciso integrar com o frontend e verificar se a api esta corretamente configurada"
- #3: Criar pagina para configurar o mapa [open] - "Essas configurações devem ser refletidas na hora de gerar o embed iframe"
- #4: Gerar o mapa via Iframe e confirmar que é possivel gera-lo [open]
- #5: Add CI workflow for API and frontend testing [open] (sem body)

### Pull Requests (via API GitHub)
- #5: Add CI workflow for API and frontend testing [open]
  - Head: vintalie-pedagios-y-caronas → Base: main
  - Sem body, sem issue vinculada, sem revisões/comentários

### Branches (git local/remoto)
**Locais:**
- * feature/property-linker-frontend (atual)
- list
- main

**Remotas:**
- origin/HEAD -> origin/main
- origin/main
- origin/vintalie-pedagios-y-caronas

### CI/Workflows
- Branch vintalie-pedagios-y-caronas contém `.github/workflows/main.yml` (commits 9d718aa, 9f47f00, bff60f8)
- PR #5 adiciona workflow de CI (runner Debian, MySQL config atualizado)
- Etapa de testes está comentada conforme notado no GITHUB_WORKFLOW.md

## 2. Mapeamento do trabalho já feito

### Frontend (branch feature/property-linker-frontend)
Commits recentes:
1. `4809a64` - feat(frontend): adicionar Institutional, AdminDashboard, UserDashboard, MapPage. API intocada.
2. `3aa3d62` - feat(frontend): conectar rotas Institutional, Admin, User, Map e Sidebar
3. `eeb41d4` - fix(deps): instalar lucide-react para resolver erro de build
4. `44666df` - fix(ts): corrigir variáveis não usadas (countryId, FormEvent) e erro de argumento em updateState
5. `86aae8c` - feat(ui): alinhar interface ao design property-linker

**Implementado:**
- ✅ **Auth/Login/Register** (`frontend/src/pages/Auth/Login.tsx`, `Register.tsx`) - relacionado à issue #1
- ✅ **Página Institucional** (`frontend/src/pages/Institutional.tsx`) - com WhatsApp wa.me/5513981412290, ícones lucide, sem emoticons (PLANO_EXECUCAO 3.2)
- ✅ **Painel do usuário** (`frontend/src/pages/UserDashboard.tsx`) - cadastro de propriedade com rua/bairro auto-criados, cadastro de produto vinculado, mapa com interação (PLANO_EXECUCAO 3.3)
- ✅ **Painel admin** (`frontend/src/pages/AdminDashboard.tsx`) - tabela grande editável célula a célula, todos os campos, adicionar/excluir linha, busca e paginação, apenas admin (PLANO_EXECUCAO 3.4)
- ✅ **Mapa** (`frontend/src/pages/MapPage.tsx`) - Leaflet/OpenStreetMap, marcadores, clique exibe produtos, link direto e código iframe (PLANO_EXECUCAO 3.5)
- ✅ **Rotas conectadas** no frontend
- ✅ **lucide-react** instalado

### API (backend Laravel 13)
Baseado em commits anteriores e PLANO_EXECUCAO.md Fase 2 - correções ainda pendentes conforme issues sugeridas na seção 3 do GITHUB_WORKFLOW.md:
- Migrations (FK em stocks, down() de products)
- Models (Stock relations, User::products, UserType::user return)
- CheckRole usando JWTAuth guard api
- PropertyController (show, update, destroy), store com auto-criação de rua/bairro
- Remover duplicação ProductController::create vs store
- Endpoints de importação/exportação em massa
- Escopo de usuário nos listados

### CI/CD
- Workflow adicionado na branch vintalie-pedagios-y-caronas (PR #5 aberto)

## 3. Issues faltantes conforme GITHUB_WORKFLOW.md seção 3

Total de 21 issues sugeridas. Existem 5 issues abertas (#1-#5). Necessário criar 16 issues faltantes.

### Backend (API) - Fase 2 (8 issues)
1. [API] Corrigir migrations (nomes das tabelas FK em stocks e down() de products) - bug, api
2. [API] Corrigir modelos (Stock relations, User::products, UserType::user return) - bug, api  
3. [API] Corrigir CheckRole para usar JWTAuth (guard api) - bug, api, segurança
4. [API] Implementar PropertyController (show, update, destroy), store com auto-criação de rua/bairro e escopo de usuário - feature, api
5. [API] Remover duplicação ProductController::create vs store - chore, api
6. [API] Adicionar endpoints de importação/exportação em massa (propriedades + produtos) - feature, api
7. [API] Adicionar escopo de usuário nos listados (user vê apenas seus registros; admin vê todos) - feature, api
8. [API] Escrever e executar batida de testes da API (auth, propriedades, produtos, estoque, localização, autorização admin/user, auto-criação de rua/bairro) - testes, api

### Frontend - Fase 3 (6 issues)
9. [Frontend] Avaliar property-linker (demo Lovable) para integração: MapView, painel/admin, recursos tipados, Leaflet + Nominatim, import/export, zod, React Query - feature, frontend, investigação
10. [Frontend] Página institucional (/institutional): apresentar projeto, botão WhatsApp 13 981412290 (wa.me/5513981412290), ícones lucide, sem emoticons - feature, frontend *(JÁ IMPLEMENTADO no branch feature/property-linker-frontend)*
11. [Frontend] Painel do usuário (/user): cadastro de propriedade com rua/bairro auto-criados, cadastro de produto vinculado, mapa com clique na propriedade → produtos - feature, frontend *(JÁ IMPLEMENTADO)*
12. [Frontend] Painel admin (/admin): tabela grande editável célula a célula, todos os campos, adicionar/excluir linha, busca e paginação, apenas admin - feature, frontend *(JÁ IMPLEMENTADO)*
13. [Frontend] Mapa (/map): Leaflet + OpenStreetMap, marcadores das propriedades, clique exibe produtos, link direto e código iframe - feature, frontend *(JÁ IMPLEMENTADO)*
14. [Frontend] Importação/exportação em massa: JSON/CSV, propriedades e produtos de uma vez, sem IDs de FK (usa nomes), pré-visualização e relatório de erros - feature, frontend

### Operação e repositório - Fase 4 (7 issues)
15. [Ops] Remover do índice Git artefatos comitados por engano (vendor/, node_modules/, database/*.sqlite, .env real) - chore, segurança, ops
16. [Ops] Verificar e remover credenciais sensíveis do histórico do Git (rotacionar segredos) - segurança, chore
17. [Ops] Adicionar LICENSE (MIT) ao repositório - documentação, chore
18. [Ops] Adicionar CONTRIBUTING.md com política de PR e code review - documentação, chore
19. [Ops] Revisar o CI workflow existente (reativar etapa de testes comentada no PR #5) - ci, chore
20. [Ops] Definir estratégia de deploy (Docker / cloud) e scripts de build - deploy, chore
21. [Ops] Configurar notificações via WhatsApp 13 981412290 ao concluir marcos - ops, chore

## 4. Vinculação de PRs existentes

### PR #5 - Add CI workflow for API and frontend testing
**Estado atual:** Aberto, sem issue vinculada, sem body, sem revisões

**Ações necessárias (conforme GITHUB_WORKFLOW.md 2.2):**
1. ✅ Issue #5 já existe ("Add CI workflow for API and frontend testing")
2. **Fazer back-link:** Comentar no PR #5 com referência à issue #5
3. **Linkar issue ao PR:** Editar descrição da issue #5 ou adicionar comentário vinculando PR #5
4. **Revisar PR #5:** Verificar workflow - etapa de testes está comentada. Decidir reativar antes do merge (issue #19 trata disto)
5. **Merge e fechar:** Após revisão e CI verde, fazer merge squash em main e fechar issue #5

**Comentários sugeridos:**
- No PR #5: "Vinculado à issue #5. Revisar workflow CI (testes comentados)."
- Na issue #5: "PR #5 aberto em vintalie-pedagios-y-caronas → main. Aguardando revisão."

## 5. Registro de discussões/comentários

### Issues existentes
- #1-#4: Sem comentários (apenas criadas)
- #5: Sem comentários

**Ações sugeridas:**
- Adicionar comentários nas issues existentes vinculando ao trabalho feito/planejado
- Para issues #1-#4, atualizar com status do trabalho realizado no branch feature/property-linker-frontend
- Registrar decisões e escopo conforme necessário

## 6. Trabalho com git local

### Estado atual
- Branch atual: feature/property-linker-frontend (com trabalho de frontend implementado)
- main e list apontam para fda8bdf
- origin/vintalie-pedagios-y-caronas tem commits de CI

### Recomendações
1. **Para PR #5 (CI):** Seguir fluxo - revisar, possivelmente reativar testes (issue #19), merge em main
2. **Para trabalho frontend:** O trabalho está na branch feature/property-linker-frontend. Conforme fluxo, deveria ter issues e PRs correspondentes. Issues #1-#4 existem mas não estão vinculados a PRs/branches seguindo o padrão ideal. Considerar criar branches por issue e PRs para rastreabilidade completa.
3. **Branches:** Seguir convenção fix/numero-issue-descricao ou feature/numero-issue-descricao

## 7. Comandos necessários (requerem token GitHub)

Como não há GH_TOKEN configurado, os comandos abaixo precisam ser executados com autenticação:

### Criar issues faltantes
```bash
API="https://api.github.com/repos/vintalie/geovintalie"
TOKEN="$GH_TOKEN"
# Criar cada issue da seção 3...
```

### Vincular PR #5 à issue #5
```bash
# Comentar no PR
curl -s -X POST "$API/issues/5/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"body": "Vinculado à issue #5. PR #5: https://github.com/vintalie/geovintalie/pull/5"}'
```

### Revisar e mergear PR #5
```bash
# Revisar
curl -s -X POST "$API/pulls/5/reviews" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"body":"Aprovado. CI workflow adicionado.", "event":"APPROVE"}'

# Merge
curl -s -X PUT "$API/pulls/5/merge" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"commit_title":"Merge PR #5: Add CI workflow", "merge_method":"squash"}'
```

## 8. Checklist de conformidade

- [x] Listar issues/PRs/branches existentes
- [x] Mapear trabalho já feito (frontend implementado, CI em branch separada)
- [x] Identificar issues faltantes conforme GITHUB_WORKFLOW.md seção 3 (16 issues a criar)
- [x] Identificar vinculação necessária para PR #5
- [x] Documentar discussões/comentários necessários
- [ ] Criar issues faltantes (requer GH_TOKEN)
- [ ] Vincular PR #5 à issue #5 (requer GH_TOKEN)
- [ ] Registrar comentários/discussões (requer GH_TOKEN)
- [ ] Revisar e mergear PR #5 conforme fluxo (requer GH_TOKEN)

**Nota:** Todas as ações que requerem escrita no GitHub (POST/PUT/PATCH) necessitam de autenticação via GH_TOKEN ou gh CLI. O ambiente atual não possui token configurado.

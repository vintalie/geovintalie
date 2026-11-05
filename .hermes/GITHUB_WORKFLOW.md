# GITHUB_WORKFLOW.md — Plano de Gestão de Mudanças (Issue → Branch → PR → Review → Merge)

Repositório: **vintalie/geovintalie** (público)
Local: `/home/mario/Documentos/geovintalie`
Backends: `api/` (Laravel 13), `frontend/` (React + Vite + TypeScript), `property-linker/` (demo Lovable)
Plano referência: `PLANO_EXECUCAO.md` (Fase 4 — Operação via GitHub, retroativa)

---

## 1. Recursos do GitHub disponíveis e como cada um será usado

Inventário feito diretamente na REST API pública (sem token, apenas leitura):

| Recurso | Endpoint REST | Status no repositório | Uso no plano de mudanças |
|---------|---------------|----------------------|--------------------------|
| **Issues** | `GET /repos/vintalie/geovintalie/issues` | 1 aberta (#5 — “Add CI workflow for API and frontend testing”) | Registro de cada correção de bug, funcionalidade e tarefa de operação. Uma issue = uma unidade de mudança. |
| **Pull Requests** | `GET /repos/vintalie/geovintalie/pulls` | 1 aberta (#5, 3 commits, sem revisões nem comentários) | Revisão de código antes de mesclar em `main`. Cada PR referencia a issue que o originou. |
| **Commits** | `GET /repos/vintalie/geovintalie/commits` | Histórico presente em `main` e `vintalie-pedagios-y-caronas` | Histórico detalhado e assinado (commits do PR #5 estão PGP-verified). Mensagens fecham issues (`Closes #N`, `Fixes #N`). |
| **Branches** | `GET /repos/vintalie/geovintalie/branches` | `main` (default), `vintalie-pedagios-y-caronas` | `main` = linha de produção. Uma branch por issue (`fix/...`, `feature/...`, `chore/...`). |
| **Actions (CI)** | `GET /repos/vintalie/geovintalie/actions/workflows` | 1 workflow ativo: `.github/workflows/main.yml` (“CI”) | Executa testes/linters em cada PR; o status do check aparece no PR e bloqueia o merge se falhar. |
| **Checks / Status** | `GET /repos/vintalie/geovintalie/commits/{sha}/status` | Disponível | Sinaliza se o commit passou no CI antes de revisar/mergir. |
| **Comentários de Issue** | `GET /repos/vintalie/geovintalie/issues/{number}/comments` | Endpoint disponível (vazio no #5) | Discussão de requisitos, escopo e critérios de aceitação da issue. |
| **Comentários de PR / Revisões** | `GET /repos/vintalie/geovintalie/pulls/{number}/comments` e `/reviews` | Endpoints disponíveis (vazios no #5) | Revisão de código linha a linha e aprovação formal do PR. |
| **Comentários de Commit** | `GET /repos/vintalie/geovintalie/commits/{sha}/comments` | Disponível | Observações sobre commits específicos (ex.: por que um refactor foi feito). |
| **Events** | `GET /repos/vintalie/geovintalie/issues/events` / `GET /events` | Disponível | Auditoria de quem abriu, fechou, mesclou e quando. |
| **Wiki** | `https://github.com/vintalie/geovintalie/wiki` | Existe (HTTP 302) | Documentação persistente: guia de contribuição, variáveis de ambiente, deploy, decisões de arquitetura. |
| **Releases** | `GET /repos/vintalie/geovintalie/releases` | Nenhuma (lista vazia) | Criar release `v1.0.0` quando as fases do PLANO_EXECUCAO.md forem concluídas. |
| **Tags** | `GET /repos/vintalie/geovintalie/tags` | Nenhuma | Marcar versões estáveis associadas a releases. |
| **Projects** | `GET /repos/vintalie/geovintalie/projects` | HTTP 404 (não configurado) | Opcional: criar um Project board (Backlog → Em andamento → Revisão → Feito) se o time quiser kanban. |
| **Discussions** | `GET /repos/vintalie/geovintalie/discussions` | HTTP 410 (indisponível/desativado) | Não usado; questões vão em Issues. |

Recursos que **registram alterações**: Issues, PRs, Commits, Comentários, Events, Checks, Releases/Tags.
Recursos que **registram discussões e comentários**: Issues, PR reviews, Comentários de Issue/PR/Commit, Discussions (indisponível), Wiki.

---

## 2. Fluxo de gestão de mudanças (retroativo)

Aplica-se a trabalho já feito (ex.: PR #5 e commits em `main`) e a todo trabalho novo.

### 2.1 Passo a passo

1. **Abrir uma issue** para a mudança (correção, funcionalidade, tarefa de operação).
   - Título: `[API] ...` / `[Frontend] ...` / `[Ops] ...`
   - Corpo: descrição, critérios de aceitação, ligação ao item do PLANO_EXECUCAO.md.
   - Labels: `bug`, `feature`, `chore`, `api`, `frontend`, `ops`, `ci`, `documentação`, `prioridade: alta/média/baixa`.
2. **Criar a branch** a partir de `main`:
   - `git checkout main && git pull origin main`
   - `git checkout -b fix/numero-issue-descricao` (ex.: `fix/5-ci-tests`)
3. **Desenvolver e commitar** na branch.
   - Commits pequenos, mensagens descritivas no imperativo.
   - Referenciar a issue: `refs #N` ou `Closes #N` quando resolver.
4. **Enviar a branch** para o GitHub:
   - `git push -u origin fix/numero-issue-descricao`
5. **Abrir um Pull Request** direcionado a `main`.
   - Título da PR ligado à issue.
   - Descrição: o que muda, como testar, prints (frontend) ou exemplos de requisição/resposta (API).
   - Linkar a issue no corpo (`Closes #N`).
6. **Revisar o PR.**
   - Revisor deixa comentários no diff e cria uma revisão (`Approve` / `Request changes` / `Comment`).
   - Autor responde comentários e faz novos commits na mesma branch (o PR atualiza sozinho).
7. **Verificar o CI (Checks).** Só mesclar se o workflow `CI` estiver verde.
8. **Mesclar (merge)** o PR em `main` (squash-and-merge recomendado para manter o histórico limpo) e excluir a branch.
9. **Fechar a issue** automaticamente com a palavra-chave no commit de merge ou manualmente.

### 2.2 Aplicação retroativa (estado atual)

- PR #5 (“Add CI workflow for API and frontend testing”) está aberto sem revisão e sem issue vinculada.
  1. Criar issue para a adição do CI (se ainda não existir).
  2. Fazer back-link: comentar no PR #5 com o número da issue; editar a issue linkando o PR #5.
  3. Revisar o PR #5 (o CI está com a etapa de testes comentada — decidir se reativa antes do merge).
  4. Fazer merge de #5 em `main` e fechar a issue vinculada.

---

## 3. Issues sugeridas para criar

Derivado do `PLANO_EXECUCAO.md` (Fases 2, 3 e 4) e do `README.md` checklist.

### Backend (API) — correções da API (Fase 2)

| # | Título sugerido | Labels | Base (PLANO_EXECUCAO.md) |
|---|-----------------|--------|--------------------------|
| 1 | Corrigir migrations (nomes das tabelas FK em stocks e down() de products) | `bug`, `api` | 2.1 |
| 2 | Corrigir modelos (Stock relations, User::products, UserType::user return) | `bug`, `api` | 2.2 |
| 3 | Corrigir CheckRole para usar JWTAuth (guard api) | `bug`, `api`, `segurança` | 2.3 |
| 4 | Implementar PropertyController (show, update, destroy), store com auto-criação de rua/bairro e escopo de usuário | `feature`, `api` | 2.4 |
| 5 | Remover duplicação ProductController::create vs store | `chore`, `api` | 2.5 |
| 6 | Adicionar endpoints de importação/exportação em massa (propriedades + produtos) | `feature`, `api` | 2.6 |
| 7 | Adicionar escopo de usuário nos listados (user vê apenas seus registros; admin vê todos) | `feature`, `api` | 2.7 |
| 8 | Escrever e executar batida de testes da API (auth, propriedades, produtos, estoque, localização, autorização admin/user, auto-criação de rua/bairro) | `testes`, `api` | 1.2–1.4 |

### Frontend (Fase 3)

| # | Título sugerido | Labels | Base |
|---|-----------------|--------|------|
| 9 | Avaliar property-linker (demo Lovable) para integração: MapView, painel/admin, recursos tipados, Leaflet + Nominatim, import/export, zod, React Query | `feature`, `frontend`, `investigação` | 3.1 |
| 10 | Página institucional (/institutional): apresentar projeto, botão WhatsApp 13 981412290 (wa.me/5513981412290), ícones lucide, sem emoticons | `feature`, `frontend` | 3.2 |
| 11 | Painel do usuário (/user): cadastro de propriedade com rua/bairro auto-criados, cadastro de produto vinculado, mapa com clique na propriedade → produtos | `feature`, `frontend` | 3.3 |
| 12 | Painel admin (/admin): tabela grande editável célula a célula, todos os campos, adicionar/excluir linha, busca e paginação, apenas admin | `feature`, `frontend` | 3.4 |
| 13 | Mapa (/map): Leaflet + OpenStreetMap, marcadores das propriedades, clique exibe produtos, link direto e código iframe | `feature`, `frontend` | 3.5 |
| 14 | Importação/exportação em massa: JSON/CSV, propriedades e produtos de uma vez, sem IDs de FK (usa nomes), pré-visualização e relatório de erros | `feature`, `frontend` | 3.6 |

### Operação e repositório (Fase 4 + README checklist)

| # | Título sugerido | Labels | Base |
|---|-----------------|--------|------|
| 15 | Remover do índice Git artefatos comitados por engano (vendor/, node_modules/, database/*.sqlite, .env real) | `chore`, `segurança`, `ops` | README, item de segurança |
| 16 | Verificar e remover credenciais sensíveis do histórico do Git (rotacionar segredos) | `segurança`, `chore` | README |
| 17 | Adicionar LICENSE (MIT) ao repositório | `documentação`, `chore` | README |
| 18 | Adicionar CONTRIBUTING.md com política de PR e code review | `documentação`, `chore` | README |
| 19 | Revisar o CI workflow existente (reativar etapa de testes comentada no PR #5) | `ci`, `chore` | PR #5, README |
| 20 | Definir estratégia de deploy (Docker / cloud) e scripts de build | `deploy`, `chore` | README |
| 21 | Configurar notificações via WhatsApp 13 981412290 ao concluir marcos | `ops`, `chore` | PLANO_EXECUCAO.md 4.4 |

Cada issue deve conter: descrição, critérios de aceitação, referência à fase do `PLANO_EXECUCAO.md`, label de prioridade e estimativa opcional.

---

## 4. Comandos e endpoints

### 4.1 Autenticação (obrigatório para criar issues via API)

A API do GitHub exige autenticação para `POST /repos/{owner}/{repo}/issues`. Não há `GH_TOKEN` configurado neste ambiente, então **as issues não foram criadas automaticamente**. O usuário deve:

1. Gerar um Personal Access Token (PAT) em https://github.com/settings/tokens (escopo `repo`).
2. Exportar: `export GH_TOKEN="ghp_..."` (ou `export GITHUB_TOKEN="ghp_..."`).
3. Ou usar `gh auth login` se instalar o GitHub CLI.

### 4.2 Criar issues com curl (com token)

```bash
API="https://api.github.com/repos/vintalie/geovintalie"
TOKEN="$GH_TOKEN"

curl -s -X POST "$API/issues" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d '{
    "title": "[API] Corrigir migrations (nomes das tabelas FK em stocks e down() de products)",
    "body": "Corrigir migrations... (ver PLANO_EXECUCAO.md, item 2.1)",
    "labels": ["bug", "api"]
  }'
```

Repetir o `POST` para cada issue da seção 3, alterando `title`, `body` e `labels`.

### 4.3 Git: branch por issue, PR e merge (sem token, via CLI local)

```bash
cd /home/mario/Documentos/geovintalie
git checkout main && git pull origin main

# Exemplo: branch para a issue de correção de migrations
git checkout -b fix/migrations-stocks-fk
# ... editar arquivos ...
git add .
git commit -m "fix(api): corrija nomes das tabelas FK em stocks e down() de products

refs #1"
git push -u origin fix/migrations-stocks-fk
```

Abrir o PR pela web (https://github.com/vintalie/geovintalie/compare/main...fix/migrations-stocks-fk) ou com curl (requer token):

```bash
curl -s -X POST "$API/pulls" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{
    "title": "Corrigir migrations de stocks e products",
    "head": "fix/migrations-stocks-fk",
    "base": "main",
    "body": "Correção de ... Closes #1"
  }'
```

Revisão e merge pela web (Files changed → Review changes → Approve) ou via API:

```bash
# Criar revisão do PR (requer token)
curl -s -X POST "$API/pulls/5/reviews" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"body":"Aprovado após ajustes.", "event":"APPROVE"}'

# Mesclar PR (requer token)
curl -s -X PUT "$API/pulls/5/merge" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"commit_title":"Merge PR #5: CI workflow", "merge_method":"squash"}'
```

### 4.4 Endpoints úteis de leitura (sem token)

```bash
API="https://api.github.com/repos/vintalie/geovintalie"
curl -s "$API/issues"               # listar issues
curl -s "$API/pulls"                # listar pull requests
curl -s "$API/commits"              # histórico de commits
curl -s "$API/branches"             # branches
curl -s "$API/releases"             # releases
curl -s "$API/tags"                 # tags
curl -s "$API/actions/workflows"    # workflows de CI
curl -s "$API/issues/5/comments"    # comentários de uma issue
curl -s "$API/pulls/5/reviews"      # revisões de um PR
```

### 4.5 Checklist de conclusão (critério do PLANO_EXECUCAO.md)

- [ ] Todas as mudanças registradas no GitHub: uma issue por item, branch por issue, PR revisado e mergeado em `main`.
- [ ] Testes da API passando (verde) e CI verde nos PRs.
- [ ] Admin edita qualquer campo na tabela grande; usuário cadastra propriedade/produto e gera mapa.
- [ ] Mapa via iframe e acesso direto; import/export em massa funcionando.
- [ ] Página institucional com WhatsApp 13 981412290.
- [ ] Issues fechadas e PRs mergeados após conclusão de cada marco; aviso via WhatsApp 13 981412290.

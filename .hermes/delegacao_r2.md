# DELEGAÇÃO — GeoVintalie Sprint R2

Este documento especifica exatamente quais artefatos cada agente deve produzir, em qual trilha, e o fluxo de validação.

---

## Contexto atual (main)
- Branch: `main` (commit `8b58648`)
- Backend: 80/87 testes passando (7 falhas: GoogleBusinessTest — escopo A2 não implementado)
- Frontend: 12 testes falhando em 5 arquivos (Reviews, Scheduling, InternalChat, LgpdPages, DeleteAccount.debug)
- PR #29 aberta mas bloqueada (branch desatualizada, rebase necessário)
- CI GitHub Actions ativo (`.github/workflows/ci.yml`)
- LICENSE e CONTRIBUTING.md já mergeados

---

## Trilha A — Desenvolvimento

### Agente: Executor Backend A2 (Google Business Profile)
**Artefato:** Implementação completa do escopo A2 no backend (api/)
- Rotas OAuth Google Business Profile
- Controller de sincronização de perfis
- Serviço de integração com API do Google
- Migrations (se necessário)
- Testes de feature para validar os 7 testes falhando em GoogleBusinessTest
**Branch:** `fix/a2-google-business-profile-r2`
**Issue:** #44, #7
**Entregável:** PR aberta, revisada e mergeada na `main`

### Agente: Executor Backend B4 (Agendamento)
**Artefato:** Backend do escopo B4
- Rotas e controllers de agendamento
- Modelos e migrations
- Testes de feature
**Branch:** `fix/b4-agendamento-chat-r2`
**Issue:** #15

### Agente: Executor Frontend B4 (Agendamento + Chat UI)
**Artefato:** Frontend do escopo B4
- Página de agendamento de serviços
- Página de chat interno
- Componentes de validação de formulário
**Branch:** `fix/b4-agendamento-chat-r2`
**Issue:** #15

### Agente: Executor Backend B5 (Avaliações)
**Artefato:** Backend do escopo B5
- Rotas e controllers de avaliações mútuas
- Modelos e migrations
- Testes de feature
**Branch:** `fix/b5-avaliacoes-r2`
**Issue:** #16

### Agente: Executor Frontend B5 (Avaliações UI)
**Artefato:** Frontend do escopo B5
- Página de avaliações recebidas e enviadas
- Formulário de avaliação com validação
**Branch:** `fix/b5-avaliacoes-r2`
**Issue:** #16

### Agente: Executor Backend B6 (Mensageria)
**Artefato:** Backend do escopo B6
- Rotas e controllers de conversas/mensagens
- Modelos e migrations
- Testes de feature
**Branch:** `fix/b6-mensageria-r2`
**Issue:** #17

### Agente: Executor Frontend B6 (Chat UI)
**Artefato:** Frontend do escopo B6
- Página de chat interno com histórico
- Compartilhamento de arquivos (interface)
**Branch:** `fix/b6-mensageria-r2`
**Issue:** #17

### Agente: Executor Backend C3 (LGPD)
**Artefato:** Backend do escopo C3
- Rotas e controllers de consentimento, anonimização, exclusão de conta
- Testes de feature
**Branch:** `fix/c3-lgpd-r2`
**Issue:** #20

### Agente: Executor Frontend C3 (LGPD UI)
**Artefato:** Frontend do escopo C3
- Páginas de consentimento (PrivacyConsent)
- Exportação de dados pessoais (DataExport)
- Exclusão de conta (DeleteAccount)
**Branch:** `fix/c3-lgpd-r2`
**Issue:** #20

### Agente: Executor QA (Testes Automatizados)
**Artefato:** Correções nos testes falhando
- Backend: corrigir ou ajustar GoogleBusinessTest (7 falhas)
- Frontend: corrigir 12 testes falhando em 5 arquivos
- Executar `php artisan test` e `npm test -- --run` e reportar 100% verde
**Branch:** `fix/testes-r2`
**Issue:** #45

---

## Trilha B — Marketing / Criativos

### Agente: Executor Marketing
**Artefato:** Atualização do README.md
- Checklist do ciclo R2 com status de cada entregável
- Links para PRs e merges realizados
- Status dos testes (backend/frontend)
**Branch:** `docs/readme-r2-progresso`

---

## Fluxo de trabalho obrigatório (todos os agentes)

1. Criar branch a partir de `main` atualizada (`git checkout main && git pull origin main && git checkout -b <branch>`)
2. Implementar o artefato especificado
3. Commit com mensagem no estilo Conventional Commits (ex: `feat(backend): implementa OAuth Google Business Profile`)
4. Push para o remoto origin
5. Abrir Pull Request no GitHub (`gh pr create`) apontando para `main`
6. Adicionar comentário na PR descrevendo o que foi feito e como testar
7. Aguardar revisão do Orquestrador
8. Se aprovado: Orquestrador faz merge na `main` e deleta a branch
9. Se reprovado: retornar ao passo 2 com as não-conformidades corrigidas

---

## Regras anti-banimento (bots/IA)

- Nunca expor tokens, senhas, `.env`, `api.env` ou credenciais em commits ou comentários
- Commits pequenos e descritivos, nunca "commit em massa" de tudo de uma vez
- Comentário de revisão em cada PR antes de solicitar merge
- Uma entrega por vez por agente; não abrir múltiplos PRs simultâneos sem revisão intermediária
- Respeitar o rate limit do GitHub (não criar dezenas de issues/PRs em sequência rápida)

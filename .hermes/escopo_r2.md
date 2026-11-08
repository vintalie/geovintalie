# ESCOPO DO PROJETO: GeoVintalie — Sprint R2 (Escopos A2, B4, B5, B6, C3, C6)

**Objetivo:** Completar a implementação dos escopos funcionais pendentes do projeto GeoVintalie (conforme README.md, seção "Escopos propostos para expansão") e deixar todos os testes automatizados (backend e frontend) passando, antes de considerar o ciclo R2 concluído.

**Entregáveis:**

1. [DESENVOLVIMENTO] Implementar Escopo A2 — Google Business Profile (OAuth, sincronização de perfis)
   - Ativos técnicos: rotas, controllers, serviços, migrations, testes de feature no backend (api/)
   - Vinculado a issue #44 e PR #29 (branch `fix/7-a2-google-business-profile` desatualizada — precisa de rebase antes do merge)

2. [DESENVOLVIMENTO] Implementar Escopo B4 — Agendamento, negociação e chat interno
   - Ativos técnicos: rotas, controllers, serviços, migrations, testes de feature (backend); páginas e componentes (frontend)

3. [DESENVOLVIMENTO] Implementar Escopo B5 — Sistema de avaliações mútuas (cliente ↔ prestador)
   - Ativos técnicos: rotas, controllers, serviços, migrations, testes de feature (backend); páginas e componentes (frontend)

4. [DESENVOLVIMENTO] Implementar Escopo B6 — Mensageria com histórico e compartilhamento de arquivos
   - Ativos técnicos: rotas, controllers, serviços, migrations, testes de feature (backend); páginas e componentes (frontend)

5. [DESENVOLVIMENTO] Implementar Escopo C3 — LGPD: consentimento, anonimização e direito ao esquecimento
   - Ativos técnicos: rotas, controllers, serviços, migrations, testes de feature (backend); páginas LGPD (frontend)

6. [DESENVOLVIMENTO] Corrigir testes automatizados pendentes
   - Backend: 7 falhas no GoogleBusinessTest (escopo A2 não implementado)
   - Frontend: 12 testes falhando em 5 arquivos (Reviews, Scheduling, InternalChat, LgpdPages, DeleteAccount.debug)

7. [MARKETING] Atualizar README.md com o progresso do ciclo R2 e links para as PRs/merges realizados
   - Artefato criativo: documento atualizado no repositório

**Critérios de aceitação:**
- Todos os testes do backend passando (php artisan test = 100% verde)
- Todos os testes do frontend passando (npm test = 100% verde)
- Cada funcionalidade entregue com PR revisada e mergeada na branch `main`
- Nenhum merge direto na `main` sem revisão documentada (comentários no GitHub)
- Nenhuma credencial (api.env, .env, vendor scribe) commiteada novamente
- CI (GitHub Actions) verde em toda push/PR na `main`

**Prazo relativo:** Ciclo R2 — entrega em até 5 sessões de trabalho (uma por entregável prioritário, em paralelo onde possível)

**Delegação:** Trilha A (Desenvolvimento) → agentes de implementação backend/frontend; Trilha B (Marketing) → agente de documentação/comunicação

---

## DELEGAÇÃO

### Trilha A — Desenvolvimento (ativos técnicos)

| Entregável | Agente responsável | Artefato específico | Branch sugerida | Issue vinculada |
|------------|-------------------|---------------------|-----------------|-----------------|
| A2 — Google Business Profile | Executor Backend A2 | Rotas/controllers/serviços de OAuth Google + testes | `fix/a2-google-business-profile-r2` | #44, #7 |
| B4 — Agendamento e chat interno | Executor Backend B4 + Executor Frontend B4 | Backend: agendamentos; Frontend: páginas de agendamento/chat | `fix/b4-agendamento-chat-r2` | #15 |
| B5 — Avaliações mútuas | Executor Backend B5 + Executor Frontend B5 | Backend: avaliações; Frontend: páginas de review | `fix/b5-avaliacoes-r2` | #16 |
| B6 — Mensageria e arquivos | Executor Backend B6 + Executor Frontend B6 | Backend: conversas/mensagens; Frontend: chat | `fix/b6-mensageria-r2` | #17 |
| C3 — LGPD | Executor Backend C3 + Executor Frontend C3 | Backend: consentimento/anonymização; Frontend: páginas LGPD | `fix/c3-lgpd-r2` | #20 |
| Testes automatizados | Executor QA | Correções nos testes falhando (backend + frontend) | `fix/testes-r2` | #45 |

### Trilha B — Marketing / Criativos

| Entregável | Agente responsável | Artefato específico | Branch sugerida |
|------------|-------------------|---------------------|-----------------|
| Atualização README com progresso R2 | Executor Marketing | README.md atualizado com checklist R2, links de PRs, status de testes | `docs/readme-r2-progresso` |

### Fluxo obrigatório (por entregável)
1. EXECUTOR implementa e commita na branch
2. EXECUTOR abre PR no GitHub apontando para `main`
3. Orquestrador (este agente) revisa e comenta na PR
4. Se aprovado → merge na `main` + delete branch
5. Se reprovado → retorna ao EXECUTOR com relatório de não-conformidades
6. Só considerar entregável concluído após merge na `main`

### Regras anti-banimento (bots/IA)
- Uma entrega por vez por agente
- Commits pequenos e descritivos (Conventional Commits)
- Comentário de revisão humano-readable em cada PR antes do merge
- Nunca expor tokens, senhas ou credenciais em commits ou comentários
- Não usar automação excessiva de comentários/PRs em sequência rápida

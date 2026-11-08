# KANBAN — GeoVintalie Sprint R2

## Colunas
1. **Backlog** — itens planejados, ainda não iniciados
2. **Todo** — prontos para começar (próximo da fila)
3. **Em Desenvolvimento** — agente trabalhando ativamente
4. **Revisão (PR Aberta)** — PR no GitHub aguardando revisão/merge
5. **Concluído (Mergeado na main)** — entregável finalizado e publicado

---

## Backlog

| ID | Item | Trilha | Prioridade | Issue | PR |
|----|------|--------|------------|-------|----|
| R2-A2 | Escopo A2 — Google Business Profile (OAuth, sync perfis) | A | Alta | #44 | — |
| R2-B4 | Escopo B4 — Agendamento, negociação e chat interno | A | Alta | #15 | — |
| R2-B5 | Escopo B5 — Avaliações mútuas (cliente ↔ prestador) | A | Alta | #16 | — |
| R2-B6 | Escopo B6 — Mensageria com histórico e arquivos | A | Média | #17 | — |
| R2-C3 | Escopo C3 — LGPD: consentimento, anonimização, direito ao esquecimento | A | Alta | #20 | — |
| R2-QA | Corrigir testes automatizados (backend + frontend) | A | Alta | #45 | — |
| R2-DOC | Atualizar README com progresso do ciclo R2 | B | Média | — | — |

---

## Todo (próximo da fila)

| ID | Item | Agente atribuído | Branch | Status |
|----|------|-----------------|--------|--------|
| R2-A2 | Google Business Profile | Executor Backend A2 | `fix/a2-google-business-profile-r2` | Aguardando despacho |
| R2-B4 | Agendamento e chat | Executor Backend B4 / Frontend B4 | `fix/b4-agendamento-chat-r2` | Aguardando despacho |
| R2-B5 | Avaliações mútuas | Executor Backend B5 / Frontend B5 | `fix/b5-avaliacoes-r2` | Aguardando despacho |
| R2-C3 | LGPD | Executor Backend C3 / Frontend C3 | `fix/c3-lgpd-r2` | Aguardando despacho |
| R2-QA | Testes automatizados | Executor QA | `fix/testes-r2` | Aguardando despacho |
| R2-DOC | README progresso | Executor Marketing | `docs/readme-r2-progresso` | Aguardando despacho |

---

## Em Desenvolvimento

| ID | Item | Agente | Início | Previsão | PR |
|----|------|--------|--------|----------|----|
| — | — | — | — | — | — |

---

## Revisão (PR Aberta)

| ID | Item | PR Link | Revisor | Status da revisão |
|----|------|---------|---------|-------------------|
| — | — | — | — | — |

---

## Concluído (Mergeado na main)

| ID | Item | PR | Merge em | Testes |
|----|------|-----|----------|--------|
| R1-DOC | LICENSE MIT | #31 | 2026-11-08 | — |
| R1-DOC | CONTRIBUTING.md | #33 | 2026-11-08 | — |
| R1-CI | GitHub Actions CI | #34 | 2026-11-08 | — |
| R1-CLEAN | Remoção api.env + vendor scribe | #36 | 2026-11-08 | — |
| R1-OPENAPI | Correção conflitos v2-openapi.yaml | #38 | 2026-11-08 | 80/87 backend |
| R1-SEEDER | Correção unique constraint estados | #40 | 2026-11-08 | 80/87 backend |
| R1-TEST-PUBLIC | Correção PublicPropertyTest | #41, #42, #43 | 2026-11-08 | 80/87 backend |

---

## Regras do Kanban

1. Um agente move um item de **Todo → Em Desenvolvimento** apenas quando inicia o trabalho.
2. Ao abrir PR, o item vai para **Revisão (PR Aberta)**.
3. Após merge na `main`, o item vai para **Concluído**.
4. Se a revisão reprovar, o item volta para **Em Desenvolvimento** com anotação de não-conformidades.
5. Apenas o Orquestrador fecha itens como **Concluído**, após confirmar `APROVADO` do Validador e merge na `main`.

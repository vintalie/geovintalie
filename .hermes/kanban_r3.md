# KANBAN — GeoVintalie Sprint R3

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
| — | — | — | — | — | — |

---

## Todo (próximo da fila)
| ID | Item | Agente atribuído | Branch | Status |
|----|------|-----------------|--------|--------|
| — | — | — | — | — |

---

## Em Desenvolvimento
| ID | Item | Agente | Início | Previsão | PR |
|----|------|--------|--------|----------|----|
| R3-C4 | Feature flags (C4) | Executor Backend C4 / Frontend C4 | sessão atual | esta sessão | — |
| R3-C1 | Auth e papéis (C1) | Executor Backend C1 / Frontend C1 | sessão atual | esta sessão | — |
| R3-B2 | Busca com filtros (B2) | Executor Backend B2 / Frontend B2 | sessão atual | esta sessão | — |
| R3-B3 | Recomendação IA (B3) | Executor Backend B3 / Frontend B3 | sessão atual | esta sessão | — |
| R3-A4 | Landing pages SEO (A4) | Executor Backend A4 / Frontend A4 | sessão atual | esta sessão | — |
| R3-A5 | Relatórios inteligência (A5) | Executor Backend A5 / Frontend A5 | sessão atual | esta sessão | — |
| R3-A6 | Quero Revender (A6) | Executor Backend A6 / Frontend A6 | sessão atual | esta sessão | — |
| R3-QA | Testes automatizados R3 | Executor QA R3 | sessão atual | esta sessão | — |
| R3-DOC | README progresso R3 | Executor Marketing R3 | sessão atual | esta sessão | — |

---

## Revisão (PR Aberta)
| ID | Item | PR Link | Revisor | Status da revisão |
|----|------|---------|---------|-------------------|
| — | — | — | — | — |

---

## Concluído (Mergeado na main)
| ID | Item | PR | Merge em | Testes |
|----|------|-----|----------|--------|
| — | — | — | — | — |

---

## Regras do Kanban
1. Um agente move um item de **Todo → Em Desenvolvimento** apenas quando inicia o trabalho.
2. Ao abrir PR, o item vai para **Revisão (PR Aberta)**.
3. Após merge na `main`, o item vai para **Concluído**.
4. Se a revisão reprovar, o item volta para **Em Desenvolvimento** com anotação de não-conformidades.
5. Apenas o Orquestrador fecha itens como **Concluído**, após confirmar `APROVADO` do Validador e merge na `main`.
6. Nenhum item sai de "Em Desenvolvimento" sem PR aberta, revisada e mergeada na `main`.

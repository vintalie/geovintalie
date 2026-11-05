# Execução manual — PRs e Issues do R2 (GeoVintalie / vintalie/geovintalie)

## Por que scripts manuais?
O ambiente **não possui `GH_TOKEN` configurado**, então não foi possível criar issues nem abrir PRs diretamente pela API do GitHub. Todos os comandos de escrita no GitHub (POST /issues, POST /pulls) exigem token com escopo `repo`.

## Pré-requisito
```bash
export GH_TOKEN="ghp_seu_token"   # escopo: repo
# ou: export GITHUB_TOKEN="ghp_seu_token"
```
Gerar token em: https://github.com/settings/tokens

## Mapeamento das tarefas R2 → issues (inferido #6-#23)
Os números abaixo vêm do arquivo local `.hermes/.created_issues` e da ordem de `issues_novos_escopos.json` (A1..A6, B1..B6, C1..C6 = #6..#23). **Não foram confirmados no remoto do GitHub** (sem token para consultar).

| Tarefa R2 | Issue (inferida) | Branch do PR | Destino |
|-----------|------------------|--------------|---------|
| A2 — Google Business Profile | #7 | `fix/7-a2-google-business-profile` | main |
| B4 — Agendamento, negociação e chat | #15 | `fix/15-b4-agendamento-chat-interno` | main |
| B5 — Avaliações mútuas cliente↔prestador | #16 | `fix/16-b5-avaliacoes-mutuas` | main |
| C2 — Observabilidade | #19 | `fix/19-c2-observabilidade` | main |
| C3 — LGPD fluxo de consentimento | #20 | `fix/20-c3-lgpd-consentimento` | main |
| C6 — Testes (unit/integração/E2E ≥80%) | #23 | `fix/23-c6-testes-e2e` | main |

## Scripts (em `scripts/github/`)
1. `./criar_issues_r2.sh` — cria as 6 issues via API (idempotente quanto ao que já consta em `.hermes/.created_issues`).
2. `./criar_branches_prs_r2.sh` — para cada tarefa: checkout main, pull, cria branch `fix/<issue>-<slug>`, commit com `refs #<issue>`, push, abre PR em `main` com `Closes #<issue>`.

## Estado local já realizado
- `main` enviado para `origin/main` (estava 2 commits à frente).
- `feature/scopes-r2-2026` já existe no remoto com todo o trabalho R2 consolidado (A2, B4, B5, C2, C3, C6).
- PR consolidado pendente: `feature/scopes-r2-2026 → main` (referencia issues #7 #15 #16 #19 #20 #23).

## Fluxo alternativo (consolidado)
Se preferir um único PR em vez de um por tarefa, abra manualmente:
https://github.com/vintalie/geovintalie/compare/main...feature/scopes-r2-2026
e no corpo do PR coloque `Closes #7 #15 #16 #19 #20 #23`.

## Após executar
Reportar os números reais de issues e PRs criados (retornados pelos scripts) e atualizar `.hermes/RELATORIO_LACUNAS.md` e `.hermes/.created_issues` / `.hermes/.created_prs_r2`.

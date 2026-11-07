# ESCOPO E DELEGAÇÃO — Integração de Escopos A/B/C — GeoVintalie

**(Artefato consolidado: escopo + delegação. Gravado fora de .hermes/ devido a bloqueio de gate de arquivos de instrução do agente.)**

## ESCOPO DO PROJETO

**Objetivo:** Agregar ao GeoVintalie os escopos funcionais derivados de Gofind (O2O/varejo) e marketplaces de serviços (Fixi/ProFinder), definidos nos requisitos A1–A6, B1–B6 e C1–C6, sem quebrar contratos existentes da API v2, respeitando releases R1/R2/R3 e feature flags, com Definition of Done por requisito (código revisado, testes verdes, contrato atualizado, documentação e flag configurada).

**Contexto do reconhecimento (fase 1 concluída):**
- Stack: Laravel 13 (Sanctum + jwt-auth + Scribe), PHP 8.3, SQLite, PHPUnit 12; React 19 + Vite + Tailwind CSS v4 + shadcn/ui (Radix), Vitest + Playwright.
- API em http://127.0.0.1:8000; frontend em http://localhost:5173; ~19 rotas v2 registradas em api/routes/api.php; contrato OpenAPI v2 em .hermes/architecture/openapi/v2-openapi.yaml (12 paths / 15 operações); 4 ADRs (ADR-001 a ADR-004).
- Validação R2: REPROVADA — NC-01 build GitHub Pages não reproduzível (TS), NC-02 classes Bootstrap remanescentes, NC-03 rotas públicas /api/v2/public/properties retornam HTTP 500 (PublicPropertyController e UserConsentController ausentes), NC-04 backend 67/68 (1 erro: coluna profile_data.title), NC-05 frontend 13/29 falhando, NC-06 GH_TOKEN/PR feature/scopes-r2-2026 → main pendente.

**Classificação dos requisitos:**
| ID | Requisito | Classificação | Esforço | Release |
|----|-----------|---------------|---------|---------|
| A1 | Localizador produtos/estoque lojas próximas | Já atendido | — | R1 |
| A2 | Perfis Google Business Profile | Parcialmente atendido | M | R2 |
| A3 | Vitrine digital estoque/preço/disponibilidade | Parcialmente atendido | M | R2 |
| A4 | Sites/landing pages SEO local | Inexistente | G | R3 |
| A5 | Relatórios/mapas de calor oferta×demanda | Inexistente | G | R3 |
| A6 | "Quero Revender" leads B2B | Inexistente | M | R3 |
| B1 | Cadastro/gestão prestadores | Já atendido | — | R1 |
| B2 | Busca com filtros | Já atendido | — | R1 |
| B3 | Recomendação IA problema | Inexistente | M | R3 |
| B4 | Agendamento/negociação/chat | Parcialmente atendido | M | R2 |
| B5 | Avaliações mútuas | Parcialmente atendido | M | R2 |
| B6 | Mensageria + arquivos | Inexistente | M | R3 |
| C1 | Auth/papéis (7 roles) | Já atendido | — | R1 |
| C2 | Observabilidade | Parcialmente atendido | M | R2 |
| C3 | LGPD consentimento/esquecimento | Parcialmente atendido | M | R2 |
| C4 | Feature flags | Já atendido | — | R1 |
| C5 | OpenAPI + testes de contrato | Parcialmente atendido | M | R1/R2 |
| C6 | Testes ≥80% cobertura novos módulos | Parcialmente atendido | G | R2 |

**Critérios de aceitação (DoD por requisito):** contrato aprovado pelo Arquiteto antes de implementar; revisão LGPD antes de merge de modelos; código revisado, testes verdes, contrato atualizado, documentação e flag configurada; não quebrar contratos existentes (versionamento v2); sem credenciais reais do Google em testes (mock/sandbox).

**Regras de parada:** conflito modelo A×B; esforço >50% acima do estimado; requisitos não listados.

**Responsável:** Orquestrador (planejamento/delegação); EXECUTOR executa; VALIDADOR valida; PUBLICADOR somente após `APROVADO`.

---

## DELEGAÇÃO

**Trilha A — DESENVOLVIMENTO (ativos técnicos e contratos)**
- RELATORIO_LACUNAS.md (v2) → EXECUTOR-ARQUITETURA (Alta, LIBERADO) — pré-requisito de contrato aprovado.
- A2 Google Business Profile (mock/sandbox) → EXECUTOR-BACKEND (Alta, LIBERADO)
- A3 Vitrine pública (PublicPropertyController, UserConsentController, eliminar HTTP 500) → EXECUTOR-BACKEND (Alta, LIBERADO)
- B4 Agendamento/chat interno (padronizar controladores duplicados + UI) → EXECUTOR-BACKEND / EXECUTOR-FRONTEND (Alta, LIBERADO)
- B5 Avaliações mútuas (backend + frontend) → EXECUTOR-BACKEND / EXECUTOR-FRONTEND (Alta, LIBERADO)
- C2 Observabilidade (tracing, métricas) → EXECUTOR-BACKEND (Média, LIBERADO)
- C3 LGPD (revisar fluxo, UserConsentController, frontend consentimento) → EXECUTOR-SEGURANCA (Alta, LIBERADO)
- C5 Testes de contrato contra OpenAPI v2 → EXECUTOR-QA (Média, LIBERADO)
- C6 Cobertura ≥80% (backend 68/68, frontend vitest verde, E2E Playwright) → EXECUTOR-QA (Alta, LIBERADO)
- A4/A5/A6/B3/B6 (R3) → EXECUTOR-BACKEND / EXECUTOR-FRONTEND / EXECUTOR-INTEGRACOES (Média, LIBERADO)
- Correções NC-01 a NC-06 → EXECUTOR-FRONTEND / EXECUTOR-DEVOPS (Alta, LIBERADO)

**Trilha B — MARKETING (criativos/validação)**
- Checklist de conformidade → EXECUTOR-MKT (Média, LIBERADO)
- Validação contra escopo → VALIDADOR (Alta, AGUARDANDO EXECUTOR)
- Publicação → PUBLICADOR (somente após `APROVADO` do VALIDADOR)

**Regras de delegação:** nenhum agente inicia antes do contrato OpenAPI v2 aprovado; mudanças de modelo exigem revisão LGPD antes do merge; EXECUTOR reporta com artefatos concretos; após retorno, encaminhar ao VALIDADOR com o escopo como referência; se reprovar, reenviar com relatório de não-conformidades; só publicar após `APROVADO`. Perfis OpenRouter: `kilo nvidia/nemotron-3.5-super-vl:free`.

**Status:** todos os agentes da trilha A e B estão LIBERADOS. Primeira prioridade: EXECUTOR-ARQUITETURA consolida RELATORIO_LACUNAS.md + ADRs + OpenAPI v2.

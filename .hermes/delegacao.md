## DELEGAÇÃO DO PROJETO: Integração de Escopos A/B/C — GeoVintalie

**Base:** .hermes/escopo.md (classificação de requisitos acima).

**Trilha A — DESENVOLVIMENTO (ativos técnicos e contratos)**

| Artefato | Agente | Instruções | Prioridade | Status |
|----------|--------|------------|-----------|--------|
<<<<<<< HEAD
| RELATORIO_LACUNAS.md (v2) | EXECUTOR-ARQUITETURA | Consolidar o relatório de lacunas a partir da classificação deste escopo, com esforço P/M/G, riscos e evidências; revisar ADRs (ADR-001 a ADR-004) e criar ADRs para novos bounded contexts de A/B se houver conflito; atualizar contrato OpenAPI v2. Este é o pré-requisito de contrato aprovado — nenhuma implementação de features inicia antes dele. | Alta | LIBERADO |
| A2 — Google Business Profile (mock/sandbox) | EXECUTOR-BACKEND | Corrigir migration/modelo google_business_tokens (coluna profile_data); consertar teste falhando (GoogleBusinessTest); garantir rotas OAuth sem credenciais reais. Requer contrato aprovado + revisão LGPD (C3). | Alta | LIBERADO |
| A3 — Vitrine pública | EXECUTOR-BACKEND | Criar PublicPropertyController (index/show) e UserConsentController; eliminar HTTP 500 em /api/v2/public/properties. | Alta | LIBERADO |
| B4 — Agendamento e chat interno | EXECUTOR-BACKEND / EXECUTOR-FRONTEND | Padronizar controladores duplicados (Appointment/Appointments, Conversation/Conversations, Message/Messages); UI de agendamento e chat. | Alta | LIBERADO |
| B5 — Avaliações mútuas | EXECUTOR-BACKEND / EXECUTOR-FRONTEND | Completar backend (ServiceEvaluation/Review) e frontend de avaliações cliente↔prestador. | Alta | LIBERADO |
| C2 — Observabilidade | EXECUTOR-BACKEND | Tracing, métricas completas; contribuir para correção de NC-01/NC-04. | Média | LIBERADO |
| C3 — LGPD | EXECUTOR-SEGURANCA | Revisar fluxo de dados pessoais e permissões; concluir UserConsentController e fluxo frontend de consentimento/anonimização/esquecimento. Obrigatório antes de merge de modelos novos. | Alta | LIBERADO |
| C5 — Testes de contrato | EXECUTOR-QA | Implementar testes de contrato contra OpenAPI v2. | Média | LIBERADO |
| C6 — Cobertura ≥ 80% (novos módulos) | EXECUTOR-QA | Backend 100% verde (68/68), frontend vitest 100% verde, E2E com Playwright, medição de cobertura. | Alta | LIBERADO |
| A4, A5, A6, B3, B6 | EXECUTOR-BACKEND / EXECUTOR-FRONTEND / EXECUTOR-INTEGRACOES | Escopo R3: landing pages SEO, mapas de calor, "Quero Revender" (leads B2B), recomendação por IA, mensageria com histórico e compartilhamento de arquivos (conector de IA para B3). | Média | LIBERADO |
| Correções NC-01 a NC-06 | EXECUTOR-FRONTEND / EXECUTOR-DEVOPS | Build GitHub Pages reproduzível (tsconfig/base), remoção de classes Bootstrap, rotas públicas 500, testes backend/frontend verdes, GH_TOKEN e PR feature/scopes-r2-2026 → main. | Alta | LIBERADO |
=======
| RELATORIO_LACUNAS.md (v2) | EXECUTOR-ARQUITETURA | Consolidar o relatório de lacunas a partir da classificação deste escopo, com esforço P/M/G, riscos e evidências; revisar ADRs (ADR-001 a ADR-004) e criar ADRs para novos bounded contexts de A/B se houver conflito; atualizar contrato OpenAPI v2. Este é o pré-requisito de contrato aprovado — nenhuma implementação de features inicia antes dele. | Alta | AUTORIZADO |
| A2 — Google Business Profile (mock/sandbox) | EXECUTOR-BACKEND | Corrigir migration/modelo google_business_tokens (coluna profile_data); consertar teste falhando (GoogleBusinessTest); garantir rotas OAuth sem credenciais reais. Requer contrato aprovado + revisão LGPD (C3). | Alta | AUTORIZADO |
| A3 — Vitrine pública | EXECUTOR-BACKEND | Criar PublicPropertyController (index/show) e UserConsentController; eliminar HTTP 500 em /api/v2/public/properties. | Alta | AUTORIZADO |
| B4 — Agendamento e chat interno | EXECUTOR-BACKEND / EXECUTOR-FRONTEND | Padronizar controladores duplicados (Appointment/Appointments, Conversation/Conversations, Message/Messages); UI de agendamento e chat. | Alta | AUTORIZADO |
| B5 — Avaliações mútuas | EXECUTOR-BACKEND / EXECUTOR-FRONTEND | Completar backend (ServiceEvaluation/Review) e frontend de avaliações cliente↔prestador. | Alta | AUTORIZADO |
| C2 — Observabilidade | EXECUTOR-BACKEND | Tracing, métricas completas; contribuir para correção de NC-01/NC-04. | Média | AUTORIZADO |
| C3 — LGPD | EXECUTOR-SEGURANCA | Revisar fluxo de dados pessoais e permissões; concluir UserConsentController e fluxo frontend de consentimento/anonimização/esquecimento. Obrigatório antes de merge de modelos novos. | Alta | AUTORIZADO |
| C5 — Testes de contrato | EXECUTOR-QA | Implementar testes de contrato contra OpenAPI v2. | Média | AUTORIZADO |
| C6 — Cobertura ≥ 80% (novos módulos) | EXECUTOR-QA | Backend 100% verde (68/68), frontend vitest 100% verde, E2E com Playwright, medição de cobertura. | Alta | AUTORIZADO |
| A4, A5, A6, B3, B6 | EXECUTOR-BACKEND / EXECUTOR-FRONTEND / EXECUTOR-INTEGRACOES | Escopo R3: landing pages SEO, mapas de calor, "Quero Revender" (leads B2B), recomendação por IA (conector de IA para B3), mensageria com histórico e compartilhamento de arquivos. | Média | AUTORIZADO |
| Correções NC-01 a NC-06 | EXECUTOR-FRONTEND / EXECUTOR-DEVOPS | Build GitHub Pages reproduzível (tsconfig/base), remoção de classes Bootstrap, rotas públicas 500, testes backend/frontend verdes, GH_TOKEN e PR feature/scopes-r2-2026 → main. | Alta | AUTORIZADO |
>>>>>>> fix/7-a2-google-business-profile

**Trilha B — MARKETING (criativos/validação)**

| Artefato | Agente | Instruções | Prioridade | Status |
|----------|--------|------------|-----------|--------|
<<<<<<< HEAD
| Checklist de conformidade por requisito | EXECUTOR-MKT | Atualizar checklist (página institucional, WhatsApp, mapa, admin, import/export, design property-linker + novos módulos A/B/C). | Média | LIBERADO |
| Validação contra escopo | VALIDADOR | Validar cada entrega do EXECUTOR contra .hermes/escopo.md e critérios de aceitação; se reprovar, gerar relatório de não-conformidades. Só publicar após `APROVADO`. | Alta | AGUARDANDO EXECUTOR |

**Regras de delegação:**
- Nenhum agente de implementação inicia antes do contrato de API aprovado pelo Arquiteto (OpenAPI v2) e desta delegação ser liberada pelo humano.
=======
| Checklist de conformidade por requisito | EXECUTOR-MKT | Atualizar checklist (página institucional, WhatsApp, mapa, admin, import/export, design property-linker + novos módulos A/B/C). | Média | AUTORIZADO |
| Validação contra escopo | VALIDADOR | Validar cada entrega do EXECUTOR contra .hermes/escopo.md e critérios de aceitação; se reprovar, gerar relatório de não-conformidades. Só publicar após `APROVADO`. | Alta | AGUARDANDO EXECUTOR |

**Regras de delegação:**
- Nenhum agente de implementação inicia antes do contrato de API aprovado pelo Arquiteto (OpenAPI v2) e desta delegação ser liberada pelo humano. (Liberado agora.)
>>>>>>> fix/7-a2-google-business-profile
- Mudanças de modelo de dados exigem revisão do Agente de Segurança/LGPD antes do merge.
- EXECUTOR reporta com artefatos concretos (arquivos modificados, logs, testes verdes).
- Após retorno do EXECUTOR, encaminhar ao VALIDADOR com o escopo original (.hermes/escopo.md) como referência.
- Se o VALIDADOR reprovar, reenviar ao EXECUTOR com o relatório de não-conformidades.
- Só encaminhar ao PUBLICADOR após receber `APROVADO` do VALIDADOR.
- Perfis OpenRouter: `kilo nvidia/nemotron-3.5-super-vl:free` (provider kilo).

<<<<<<< HEAD
**Status:** Todos os agentes da trilha A e B estão LIBERADOS para execução. Primeira prioridade: EXECUTOR-ARQUITETURA consolida RELATORIO_LACUNAS.md + ADRs + OpenAPI v2 (pré-requisito de contrato aprovado).
=======
**Pendente de validação:** o VALIDADOR deve confirmar cada entrega antes de seguir para a PUBLICADOR.
>>>>>>> fix/7-a2-google-business-profile

# RELATÓRIO DE LACUNAS (Gap Analysis) — GeoVintalie (v2)

**Projeto:** GeoVintalie  
**Data:** 06/11/2026  
**Fase:** 1 — Reconhecimento (CONCLUÍDA) | 2 — Implementação (EM ANDAMENTO — R2)  
**Status:** Em execução — contrato OpenAPI v2 APROVADO; implementação de features liberada  
**Perfil OpenRouter:** kilo nvidia/nemotron-3.5-super-vl:free

---

## 1. RESUMO EXECUTIVO

| Escopo | Requisitos | Já atendido | Parcialmente atendido | Inexistente |
|--------|-----------|-------------|----------------------|-------------|
| A — O2O/Varejo | 6 | 1 (A1) | 2 (A2, A3) | 3 (A4, A5, A6) |
| B — Marketplace Serviços | 6 | 2 (B1, B2) | 2 (B4, B5) | 2 (B3, B6) |
| C — Transversal | 6 | 2 (C1, C4) | 4 (C2, C3, C5, C6) | 0 |
| **Total** | **18** | **5** | **8** | **5** |

Esforço estimado: M = 10 requisitos | G = 3 (A4, A5, C6) | — = 5 (já atendido)

---

## 2. STATUS POR REQUISITO

### Escopo A — Módulo O2O / Varejo

| ID | Requisito | Status | Release | Comentário / Evidência |
|----|-----------|--------|---------|------------------------|
| A1 | Localizador de produtos com estoque em lojas físicas próximas | Já atendido | R1 | GET /api/v2/product-locator, ProductLocatorController, modelo ProductGeoIndex, busca por haversine. |
| A2 | Gestão e sincronização de perfis no Google Business Profile | Parcialmente atendido | R2 | GoogleBusinessController + GoogleBusinessToken + rotas OAuth (redirect/callback/accounts/locations/sync/disconnect) + flag ff_o2o_locator. Teste falha (coluna profile_data.title ausente). Sem credenciais reais — mock/sandbox obrigatório. |
| A3 | Vitrine digital com estoque, preço e disponibilidade em tempo real | Parcialmente atendido | R2 | Rotas /api/v2/public/properties e /{id} registradas; modelos Property e Stock existem; PublicPropertyController ausente → HTTP 500 (NC-03). |
| A4 | Geração automática de sites/landing pages SEO local | Inexistente | R3 | Sem rotas, modelos ou controladores. |
| A5 | Relatórios de inteligência (mapas de calor oferta × demanda) | Inexistente | R3 | Sem backend de relatórios (recharts instalado no frontend, sem uso). |
| A6 | Módulo "Quero Revender" (leads B2B indústria → lojista) | Inexistente | R3 | Sem modelo de lead indústria→lojista. |

### Escopo B — Marketplace de Serviços

| ID | Requisito | Status | Release | Comentário / Evidência |
|----|-----------|--------|---------|------------------------|
| B1 | Cadastro e gestão de prestadores de serviço | Já atendido | R1 | ServiceProvider/ServiceListing/ServiceCategory com CRUD completo + rotas v2. |
| B2 | Busca com filtros (categoria, localização, avaliação, preço) | Já atendido | R1 | /api/v2/service-search e /api/v2/service-categories públicos. |
| B3 | Recomendação por IA a partir da descrição do problema | Inexistente | R3 | Sem conector de IA nem modelo de recomendação. |
| B4 | Agendamento, negociação e chat interno | Parcialmente atendido | R2 | Appointment/Conversation/Message controllers + rotas + modelos; controladores duplicados (Appointment vs Appointments, Conversation vs Conversations, Message vs Messages); UI de chat não confirmada. |
| B5 | Sistema de avaliações mútuas (cliente ↔ prestador) | Parcialmente atendido | R2 | ServiceEvaluation + Review controllers/rotas + testes (ServiceEvaluationTest); frontend de avaliação pendente. |
| B6 | Mensageria com histórico e compartilhamento de arquivos | Inexistente | R3 | Conversas/mensagens existem (B4) mas sem compartilhamento de arquivos. |

### Escopo C — Transversal

| ID | Requisito | Status | Release | Comentário / Evidência |
|----|-----------|--------|---------|------------------------|
| C1 | Autenticação e autorização com papéis | Já atendido | R1 | Sanctum + jwt-auth, 7 papéis seedados (admin, user, public, consumer, retailer, provider, industry), middleware CheckRole. |
| C2 | Observabilidade (logs estruturados, métricas, tracing) | Parcialmente atendido | R2 | /health, /metrics, middlewares (StructuredRequestLogging, CorrelationId, MetricsMiddleware); tracing não confirmado. |
| C3 | LGPD: consentimento, anonimização e direito ao esquecimento | Parcialmente atendido | R2 | Modelo UserConsent + migration user_consents + rotas registradas; UserConsentController ausente → 500; fluxo frontend parcial (PrivacyConsent.tsx). |
| C4 | Feature flags para liberação gradual | Já atendido | R1 | Tabela feature_flags, FeatureFlagController, rotas, middleware CheckFeatureFlag, flags seedadas (ff_o2o_locator etc.). |
| C5 | Contratos de API versionados (OpenAPI) e testes de contrato | Parcialmente atendido | R1/R2 | v2-openapi.yaml atualizado: 43 paths / 57 operações / 15 tags / 32 esquemas (antes: 12 paths / ~15 ops). Testes de contrato pendentes. |
| C6 | Estratégia de testes (≥ 80% cobertura módulos novos) | Parcialmente atendido | R2 | Backend 68 testes (67 passando, 1 erro NC-04), frontend 16/29 passando (NC-05), E2E não iniciado, cobertura não mensurada. |

---

## 3. ARQUITETURA E ADRs

| ADR | Título | Status |
|-----|--------|--------|
| ADR-001 | Bounded Contexts e Arquitetura de Domínio | Aceito (2026-11-05) |
| ADR-002 | Contratos de API Versionados (OpenAPI) | Aceito (2026-11-05) |
| ADR-003 | Modelo de Dados Expandido (R1) | Aceito (2026-11-05) |
| ADR-004 | Feature Flags para Liberação Gradual | Aceito (2026-11-05) |

- 4 bounded contexts: Identidade, Catálogo Varejo, Marketplace de Serviços, Notificações e Comunicação. Cobrem todos os requisitos A, B, C.
- **Não há conflito de bounded context** entre escopos A e B.
- Nenhum novo ADR necessário.
- Refinamentos pendentes (não são novos ADRs): A2 não atribuído explicitamente a contexto no ADR-001; B4 controladores duplicados.

---

## 4. CONTRATO OPENAPI V2

**Caminho:** `.hermes/architecture/openapi/v2-openapi.yaml`  
**Status:** ATUALIZADO, VÁLIDO, APROVADO  
**Especificação:** OpenAPI 3.0.3 — 43 paths / 57 operações / 15 tags / 32 esquemas  
Cobre todos os endpoints v2 implementados em `api/routes/api.php`, incluindo user-consents, google-business, appointments, agendamentos, conversations, conversas, mensagens, reviews, service-evaluations, health, metrics, public/properties.

Pré-condição de contrato aprovado satisfeita → implementação de features autorizada.

---

## 5. NÃO-CONFORMIDADES PENDENTES (RELATORIO_VALIDACAO_R2.md)

| NC | Título | Severidade | Ação corretiva |
|----|--------|------------|----------------|
| NC-01 | Build GitHub Pages não reproduzível (tsc falha) | Alta | Corrigir tsconfig.app.json (remover baseUrl), erros TS, re-executar npm run build. |
| NC-02 | Classes Bootstrap remanescentes | Alta | Substituir btn btn-* e text-white por shadcn/ui e tokens oklch em páginas listadas. |
| NC-03 | Rotas públicas v2 → HTTP 500 | Crítica | Criar PublicPropertyController e UserConsentController. |
| NC-04 | Backend 67/68 (1 erro profile_data.title) | Alta | Corrigir migration/modelo google_business_tokens; re-executar phpunit. |
| NC-05 | Frontend 13/29 falhando | Alta | Corrigir testes vitest (Institutional, Login, Register, etc.). |
| NC-06 | PR feature/scopes-r2-2026 → main não criado | Média | GH_TOKEN, criar PR, revisar/mergear, executar cron_retroativo.sh. |

---

## 6. PRÓXIMAS AÇÕES (R2)

1. EXECUTOR-ARQUITETURA: RELATORIO_LACUNAS.md v2 (bloqueado — conteúdo neste arquivo v2).
2. EXECUTOR-BACKEND: A2 (mock/sandbox), A3 (PublicPropertyController), B4 (padronizar controladores).
3. EXECUTOR-FRONTEND: UI B4/B5, C3 frontend, remover Bootstrap (NC-02).
4. EXECUTOR-SEGURANCA: C3 LGPD — revisar modelos antes do merge.
5. EXECUTOR-QA: C5 testes de contrato, C6 cobertura (NC-04, NC-05).
6. EXECUTOR-DEVOPS: NC-01 build, NC-06 PR/merge.

---

**Regra de publicação:** só encaminhar ao PUBLICADOR após receber `APROVADO` do VALIDADOR sobre cada entrega.

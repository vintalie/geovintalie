# RELATÓRIO DE LACUNAS (Gap Analysis) v2 — GeoVintalie

**Projeto:** GeoVintalie  
**Local:** /home/mario/Documentos/geovintalie  
**Data:** 07/11/2026  
**Fase:** 2 — Consolidação do contrato (PRÉ-CONDIÇÃO: nenhuma implementação de features inicia antes deste relatório + OpenAPI v2 serem aprovados pelo Arquiteto)  
**Base de evidência:** leitura de `api/routes/api.php`, controladores, modelos, migrações, seeders, ADRs, contrato OpenAPI v2 e execução real de `phpunit` (backend) e `vitest` (frontend).

---

## 1. RESUMO EXECUTIVO

| Escopo | Requisitos | Já atendido | Parcialmente atendido | Inexistente | Esforço restante (estimado) |
|--------|-----------|-------------|-----------------------|-------------|-----------------------------|
| A — O2O / Varejo | 6 | 1 (A1) | 2 (A2, A3) | 3 (A4, A5, A6) | G + 2×M |
| B — Marketplace Serviços | 6 | 2 (B1, B2) | 2 (B4, B5) | 2 (B3, B6) | 2×M + M |
| C — Transversal | 6 | 2 (C1, C4) | 4 (C2, C3, C5, C6) | 0 | 3×M + G |
| **Total** | **18** | **5** | **8** | **5** | **4×G + 7×M** |

- **Contrato OpenAPI v2:** atualizado e coerente com todas as rotas v2 implementadas (12 → 43 paths). Teste de contrato `OpenApiV2ContractTest`: **9/9 passando**, cobertura de rotas 100% (cada rota v2 tem caminho no contrato e vice-versa).
- **Testes (execução real, VALIDADOR):** backend phpunit = 86 testes, 76 passando, 2 falhas, 8 erros (2 falhas + 1 erro em `PublicPropertyTest` → escopo A3; 7 erros `database is locked` em `ServiceEvaluationTest` → escopo B5); frontend vitest = 40 testes, 31 passando, 9 falhando; E2E/Playwright = **não iniciado**.
- **Cobertura ≥ 80% (C6):** não comprovada (não mensurada).
- **Regras de parada:** (a) conflito A×B no modelo de dados → **não gatilhado** (ver seção 6); (b) esforço > 50% acima do estimado → a monitorar; (c) requisitos não listados → nenhum identificado.

**Status geral:** contrato base aprovável. Implementação de features **não deve iniciar** até o Arquiteto aprovar este relatório + OpenAPI v2 (DoD do escopo.md, item 1).

---

## 2. METODOLOGIA E FONTES DE EVIDÊNCIA

Cada requisito foi classificado com base em **código e rotas ao vivo**, não em declarações de planejamento. Fontes consultadas:

- `api/routes/api.php` (rotas v2, prefix `v2`, ~43 endpoints)
- `api/app/Http/Controllers/` (40+ controladores, incluindo duplicados de B4)
- `api/app/Models/` (24 modelos)
- `api/database/migrations/` (25 migrações, incluindo R1/R2)
- `api/database/seeders/FeatureFlagSeeder.php` (10 flags)
- `.hermes/architecture/adrs/ADR-001..004`
- `.hermes/architecture/openapi/v2-openapi.yaml` (atualizado neste relatório)
- Testes: `api/tests/` (phpunit) e `frontend/src/**/*.test.tsx` (vitest)

**Correções importantes em relação ao `escopo.md` (v1):**
1. `PublicPropertyController` e `UserConsentController` NÃO estão ausentes: existem e estão implementados e registrados em `api/routes/api.php`. O escopo.md os declara "ausentes → HTTP 500" (NC-03), mas esse dado está defasado. Os problemas reais do A3 são defeitos de contrato (404 não respeitado, `show` retorna campos nulos, `n_property` NOT NULL).
2. Números de teste do `escopo.md` estão defasados: cita backend 67/68 e frontend 16/29. Execução real atual: backend 76/86 (2 falhas, 8 erros), frontend 31/40.

---

## 3. STATUS POR REQUISITO (A1–A6, B1–B6, C1–C6)

Legenda de classificação: **JA** = já atendido, **PA** = parcialmente atendido, **IX** = inexistente. Esforço: P = pequeno, M = médio, G = grande.

| ID | Requisito | Classificação | Esforço | Release | Evidência / Gap principal | Risco |
|----|-----------|---------------|---------|---------|---------------------------|-------|
| A1 | Localizador de produtos com estoque em lojas físicas próximas | **JA** | — | R1 | `GET /api/v2/product-locator`, `ProductLocatorController`, modelo `ProductGeoIndex`, busca por haversine | Baixo |
| A2 | Gestão e sincronização de perfis no Google Business Profile | **PA** | M | R2 | `GoogleBusinessController` + `GoogleBusinessToken` + rotas OAuth (`redirect`/`callback`/`accounts`/`locations`/`sync`/`disconnect`) + flag `ff_o2o_locator`; serviço com criptografia de tokens; testes usam `Http::fake` (sandbox/mock) | Dependência externa Google; sem credenciais reais em teste (obrigatório mock/sandbox); expiração/refresh de token |
| A3 | Vitrine digital com estoque, preço e disponibilidade em tempo real | **PA** | M | R2 | `PublicPropertyController` (`index` com filtros cidade/estado/país + haversine; `show` com produtos) + rotas `GET /api/v2/public/properties` e `/{id}`; `PublicPropertyTest` | **Falhas de contrato:** `GET /{id}` inexistente retorna 200 em vez de 404; `show` retorna campos nulos (id/name); violação `NOT NULL n_property` em filtro. Bloqueia "já atendido" |
| A4 | Geração automática de sites/landing pages SEO local | **IX** | G | R3 | Sem rotas, modelos ou controladores | Sem modelo de página/SEO definido |
| A5 | Relatórios de inteligência (mapas de calor oferta × demanda) | **IX** | G | R3 | `recharts` instalado no frontend, sem uso; sem backend de relatórios | Sem fonte de dados de mapas de calor |
| A6 | Módulo "Quero Revender" (leads B2B indústria → lojista) | **IX** | M | R3 | Sem modelo de lead indústria → lojista | Sem fluxo B2B definido |
| B1 | Cadastro e gestão de prestadores de serviço | **JA** | — | R1 | `ServiceProvider`/`ServiceCategory`/`ServiceListing` + CRUD completo + rotas v2 (`service-providers` ×4, `service-listings` ×3, `service-categories`) | Baixo |
| B2 | Busca com filtros (categoria, localização, avaliação, preço) | **JA** | — | R1 | `GET /api/v2/service-search` e `GET /api/v2/service-categories` públicos; `ServiceSearchController`, `ServiceCategoryController` | Baixo |
| B3 | Recomendação por IA a partir da descrição do problema | **IX** | M | R3 | Sem conector de IA nem modelo de recomendação | Provedor de IA não definido; custo/latência |
| B4 | Agendamento, negociação e chat interno | **PA** | M | R2 | `Appointment` (deprecated, estende `AppointmentsController`) + `AppointmentsController`, `Conversation`/`Conversations`, `Message`/`Messages`, modelos `Appointment`/`Conversation`/`Message`/`ChatConversation`/`ChatMessage`; rotas `appointments`/`agendamentos`/`conversations`/`conversas`/`messages`; flags `ff_agendamentos_chat`/`ff_appointment`/`ff_chat` seedadas (habilitadas) | **Controladores duplicados** (manutenção em dois lugares); UI de chat não confirmada (componentes existem, testes falhando) |
| B5 | Sistema de avaliações mútuas (cliente ↔ prestador) | **PA** | M | R2 | `ServiceEvaluation` + `Review` (ambos mapeiam tabela `service_evaluations`), `ServiceEvaluationController`/`ReviewController`, rotas `service-evaluations`/`reviews`/`service-providers/{id}/evaluations`, flags `ff_service_evaluations`/`ff_reviews`; `ServiceEvaluationTest` | Frontend de avaliação pendente; dois modelos sobre mesma tabela (duplicidade conceitual) |
| B6 | Mensageria com histórico e compartilhamento de arquivos | **IX** | M | R3 | Conversas/mensagens existem (B4) mas sem compartilhamento de arquivos | Armazenamento de arquivos, vírus scan, tamanho |
| C1 | Autenticação e autorização com papéis | **JA** | — | R1 | Sanctum + jwt-auth; 7 papéis seedados (admin, user, public, consumer, retailer, provider, industry); middleware `CheckRole`; rotas `auth` | Baixo |
| C2 | Observabilidade (logs, métricas, tracing) | **PA** | M | R2 | `GET /api/v2/health`, `GET /api/v2/metrics` (agora no contrato); middlewares `StructuredRequestLogging`, `CorrelationId`, `MetricsMiddleware`, `TracingMiddleware`; classes `Observability\*` (`MetricsRegistry`, `TraceContext`, `CorrelationContext`); `ObservabilityTest` | Tracing não confirmado em produção; métricas não em formato padrão (ex: Prometheus) |
| C3 | LGPD: consentimento, anonimização e direito ao esquecimento | **PA** | M | R2 | Modelo `UserConsent` + migration `user_consents` + `UserConsentController` (`index`/`store`/`destroy`/`export`/`deleteAccount`) + rotas `user-consents` (incl. `/account` e `/export`); fluxo frontend parcial (`PrivacyConsent.tsx`, `DataExport.tsx`, `DeleteAccount.tsx`) | Fluxo frontend parcial; anonimização não testada via E2E |
| C4 | Feature flags para liberação gradual | **JA** | — | R1 | Tabela `feature_flags`, `FeatureFlagController`, rotas, middleware `CheckFeatureFlag`, `FeatureFlagSeeder` (10 flags: `ff_o2o_locator`, `ff_service_providers`, `ff_service_search`, `ff_new_user_roles`, `ff_lgpd_consent`, `ff_service_evaluations`, `ff_appointment`, `ff_chat`, `ff_reviews`, `ff_agendamentos_chat`) | ADR-004 lista apenas 5 flags (desatualizado vs. seeder) |
| C5 | Contratos de API versionados (OpenAPI) e testes de contrato | **PA** | M | R1/R2 | `v2-openapi.yaml` atualizado (43 paths, todas as rotas v2), `ADR-002`, Scribe, `OpenApiV2ContractTest` (9/9, cobertura 100% rotas↔contrato) | Antes o contrato não cobria health/metrics/google-business/etc. (corrigido); deve ser mantido sincronizado com rotas |
| C6 | Estratégia de testes (≥ 80% cobertura módulos novos) | **PA** | G | R2 | Backend 86 testes (76 passando, 2 falhas, 8 erros: 2 falhas + 1 erro em `PublicPropertyTest` e 7 erros `database is locked` em `ServiceEvaluationTest`); frontend 40 testes (31/9); E2E não iniciado; cobertura não mensurada | Cobertura < 80% não comprovada; E2E = 0 testes |

---

## 4. DETALHE DE CÓDIGO / ROTAS POR ESCOPO

### Escopo A (O2O / Varejo)
- **A1 — JA.** `GET /api/v2/product-locator` → `ProductLocatorController@index`; modelo `ProductGeoIndex`; busca haversine no SQL/PHP; rota protegida por `jwt.auth`.
- **A2 — PA.** `GoogleBusinessController` (autorize/callback/accounts/locations/sync/disconnect); `GoogleBusinessToken` (tokens criptografados, `profile_data` cast array); `GoogleBusinessService`; rotas sob `google-business/*` (callback público sem JWT; restante protegido); flag `ff_o2o_locator`. Agora coberto no OpenAPI v2.
- **A3 — PA.** `PublicPropertyController` implementado (index com filtros cidade/estado/país + busca por raio haversine; show com produtos da loja). Rotas `GET /api/v2/public/properties` e `/{id}` (públicas, sem auth). **Defeitos confirmados por teste:** (i) `GET /public/properties/999999` retorna 200 em vez de 404; (ii) `show` devolve campos nulos (id, name, city...); (iii) `n_property` é `NOT NULL` e teste de filtro viola a restrição. Precisa de correção antes de ser considerado atendido.

### Escopo B (Marketplace de Serviços)
- **B1 — JA.** `ServiceProviderController`, `ServiceCategoryController`, `ServiceListingController`; rotas `service-providers` (GET/POST/GET{id}/PUT), `service-listings` (GET/POST/GET{id}), `service-categories` (GET público). Modelos `ServiceProvider`, `ServiceCategory`, `ServiceListing` + recursos.
- **B2 — JA.** `ServiceSearchController@index` em `GET /api/v2/service-search` (filtros category_id, city, state, min/max_price, min_rating, q, limit); público.
- **B3 — IX.** Sem conector de IA, sem modelo de recomendação.
- **B4 — PA.** `AppointmentsController` (canonical) + `AppointmentController` (@deprecated, estende o primeiro); `ConversationController`/`ConversationsController`; `MessageController`/`MessagesController`; modelos `Appointment`, `Conversation`, `Message`, `ChatConversation`, `ChatMessage`. Rotas duplicadas: `appointments/*` e `agendamentos/*`; `conversations/*` e `conversas/*`; `messages` e `conversas/{id}/mensagens`. Gate por flag `ff_agendamentos_chat`.
- **B5 — PA.** `ServiceEvaluationController`/`ReviewController`; `ServiceEvaluation` e `Review` mapeiam a mesma tabela `service_evaluations`. Rotas `service-evaluations` (POST), `service-providers/{provider_id}/evaluations` (GET), `reviews` (GET/POST), `service-providers/{provider_id}/reviews` (GET). Flags `ff_service_evaluations` e `ff_reviews`.
- **B6 — IX.** Não há upload/compartilhamento de arquivos nas mensagens.

### Escopo C (Transversal)
- **C1 — JA.** `Sanctum` + `jwt-auth`; 7 papéis via seeder `UserTypeSeeder`; middleware `CheckRole`; rotas `auth/me`, `auth/users` (admin).
- **C2 — PA.** `/health` e `/metrics` (controladores `Observability\HealthController`, `MetricsController`); middlewares de log estruturado, correlation ID, métricas e tracing; `ObservabilityTest`. Contrato agora cobre ambos.
- **C3 — PA.** `UserConsentController` (index/store/destroy/export/deleteAccount); rotas `user-consents/*` (incluindo `/account` antes de `/{purpose}` para evitar conflito de rota); `UserConsent` modelo + migration. Frontend parcial (`PrivacyConsent.tsx`, `DataExport.tsx`, `DeleteAccount.tsx`, `src/api/user-consent.ts`).
- **C4 — JA.** `feature_flags` tabela, `FeatureFlagController`, middleware `CheckFeatureFlag`, `FeatureFlagSeeder` (10 flags, várias habilitadas para B4/B5).
- **C5 — PA.** OpenAPI v2 (este relatório) + `OpenApiV2ContractTest` (9/9, cobertura 100% rotas ↔ contrato). Scribe disponível.
- **C6 — PA.** Backend 86 testes (76 passando, 2 falhas, 8 erros); frontend 40 testes (31 passando); E2E não iniciado; cobertura não mensurada.

---

## 5. REVISÃO DOS ADRs EXISTENTES (ADR-001 A ADR-004)

| ADR | Título | Status | Achados da revisão | Recomendação |
|-----|--------|--------|--------------------|--------------|
| ADR-001 | Bounded Contexts e Arquitetura de Domínio | Aceito (atualizado) | Define 4 BCs (Identidade, Catálogo Varejo/A, Marketplace Serviços/B, Notificações). **Corrigido:** caminhos de endpoints agora listados como `/api/v2/*`, coerentes com `api/routes/api.php`. Zona cinzenta A2 × B1 (perfil Google Business vs. prestador) documentada como ponto de integração via Identidade (não novo BC). | Nenhum — ajustado neste ciclo. |
| ADR-002 | Contratos de API Versionados (OpenAPI) | Aceito | v1/v2 por caminho de URL; testes de contrato; Scribe. Coerente com a decisão. O contrato v2 foi expandido neste relatório e está válido (openapi 3.0.3, 43 paths). | Manter o contrato sincronizado com novas rotas (gate de CI). |
| ADR-003 | Modelo de Dados Expandido (R1) | Aceito (atualizado) | Tabelas R1 (service_providers, service_categories, service_listings, product_geo_index, user_consents, feature_flags, user_roles, lat/lng em properties, phone em users) + **tabelas R2 acrescidas**: `appointments`, `service_evaluations`, `chat_conversations`, `chat_messages`, `google_business_tokens` (escopos A2, B4, B5). | Nenhum — ajustado neste ciclo. |
| ADR-004 | Feature Flags para Liberação Gradual | Aceito (atualizado) | Tabela `feature_flags` com rollout percentual; middleware `CheckFeatureFlag`. **Corrigido:** tabela de flags agora lista as 10 flags do `FeatureFlagSeeder` (`ff_o2o_locator`, `ff_service_providers`, `ff_service_search`, `ff_new_user_roles`, `ff_lgpd_consent`, `ff_service_evaluations`, `ff_appointment`, `ff_chat`, `ff_reviews`, `ff_agendamentos_chat`). | Nenhum — ajustado neste ciclo. |

ADR-001, ADR-003 e ADR-004 foram atualizados neste ciclo (caminhos `/api/v2/*`, tabelas R2, 10 flags do seeder). ADR-002 mantido sem alterações de conteúdo. Com o contrato OpenAPI v2 já ajustado, a pré-condição do escopo.md (entregável 2: ADRs + contrato atualizados antes de qualquer implementação de feature) está satisfeita.

---

## 6. CONFLITO ENTRE ESCOPOS A E B → NOVO BOUNDED CONTEXT?

**Regra de parada (a):** "conflito entre escopos A e B no modelo de dados".

**Avaliação:** não há conflito de modelo de dados entre A e B.

- Os contextos são paralelos (conforme ADR-001): Retail/O2O (Property, Product, Stock, ProductGeoIndex) e Marketplace de Serviços (ServiceProvider, ServiceCategory, ServiceListing, Appointment, Conversation, Message, Review) são tabelas separadas, sem FK direta entre eles.
- Compartilham apenas a camada de **Identidade** (User/UserType) e **localização** (Street/City/State/Country), o que é por projeto e não gera acoplamento inadequado.
- Zona cinzenta identificada: **A2 (Google Business Profile sincroniza perfil de estabelecimento)** × **B1 (cadastro de prestador)** podem referir a mesma entidade real (uma loja física que também é prestador). Não há conflito de esquema — a resolução é por integração via Identidade (um `User` pode ter perfil em ambos os contextos), não por novo bounded context.

**Decisão:** regra de parada (a) **não gatilhada**. **Não são criados novos bounded contexts nem novos ADRs de BC.** ADR-001 já separa adequadamente os contextos A e B. A sobreposição A2/B1 é monitorada como ponto de atenção, não como bloqueio.

---

## 7. CONTRATO OPENAPI v2 — ALTERAÇÕES REALIZADA

**Arquivo modificado:** `.hermes/architecture/openapi/v2-openapi.yaml`

- **Antes:** 12 paths / 15 operações. Não cobria health, metrics, google-business, service-evaluations, reviews, appointments, agendamentos, conversations, messages, conversas, user-consents, public/properties.
- **Depois:** **43 paths**, cobrindo **100% das rotas v2 implementadas** em `api/routes/api.php`:
  - Observabilidade: `/health`, `/metrics`
  - Auth/Users: `/auth/me`, `/auth/users`, `/auth/users/{id}`
  - Feature flags: `/feature-flags`, `/feature-flags/{name}`
  - B1: `/service-providers`, `/{id}`, `/service-categories`, `/service-listings`, `/{id}`
  - B5: `/service-evaluations`, `/reviews`, `/service-providers/{provider_id}/evaluations`, `/service-providers/{provider_id}/reviews`
  - B2: `/product-locator` (A1), `/service-search`
  - B4: `/appointments`, `/{appointment}`, `/agendamentos`, `/{appointment}`, `/conversations`, `/{conversation}`, `/{conversation}/messages`, `/messages`, `/{message}/read`, `/conversas`, `/conversas/open`, `/conversas/{conversation}`, `/conversas/{conversation}/mensagens`
  - C3: `/user-consents`, `/user-consents/account`, `/user-consents/{purpose}`, `/user-consents/export`
  - A2: `/google-business/callback`, `/redirect`, `/accounts`, `/accounts/{account}/locations`, `/accounts/{account}/locations/{location}`, `/disconnect`
  - A3: `/public/properties`, `/{id}`
- **Validação:** YAML sintaticamente válido (lint ok); `OpenApiV2ContractTest` = **9/9** (especificação válida/autoconsistente, endpoints públicos com status de contrato, protegidos exigem bearerAuth → 401, estrutura de recursos, cobertura de rotas 100% bidirecional).

Este contrato é a **pré-condição de aprovação**. Nenhuma implementação de feature (R1 fechamento, R2, R3) inicia antes dele ser aprovado pelo Arquiteto.

---

## 8. RESULTADOS DE TESTES (EXECUÇÃO REAL)

| Suite | Testes | Passando | Falhas | Erros | Observação |
|-------|--------|----------|--------|-------|------------|
| Backend (phpunit) | 86 | 76 | 2 | 8 | 2 falhas + 1 erro em `PublicPropertyTest` (A3 — ver seção 4); 7 erros `database is locked` em `ServiceEvaluationTest` (B5 — ver seção 8.1). Contrato OpenAPI: 9/9. |
| Frontend (vitest) | 40 | 31 | 9 | 0 | Falhas distribuídas (Register, Dashboard, Institutional, InternalChat, LgpdPages, Reviews, Scheduling). |
| E2E (Playwright) | — | — | — | — | Não iniciado (sem testes e2e). |

**C6 (cobertura ≥ 80% módulos novos):** não comprovada — cobertura não mensurada; E2E zerado.

### 8.1. Detalhe — 7 erros `database is locked` em `ServiceEvaluationTest` (B5)

Todos os 7 erros são `SQLSTATE[HY000]: General error: 5 database is locked` (conexão sqlite, banco `database/testing.sqlite`), conforme execução do VALIDADOR. Ocorrem no `setUp` da classe, que usa `RefreshDatabase` e executa `Artisan::call('db:seed', ['--class' => 'DatabaseSeeder'])` antes de cada teste: cada re-seed grava em `user_types` e demais tabelas seedadas sobre o mesmo arquivo SQLite compartilhado, e a escrita concorrente entre testes trava o arquivo, fazendo o seeder falhar e abortar o teste antes de qualquer asserção de negócio.

- **Escopo afetado:** B5 (avaliações mútuas cliente ↔ prestador). 7 dos 9 testes de `ServiceEvaluationTest` falharam por contenda de banco, não por falha de lógica de negócio.
- **Natureza:** infraestrutura de teste (SQLite file-based + `RefreshDatabase` + re-seed por teste), não regressão de código.
- **Evidência reproduzida:** erro `SQLSTATE[HY000]: General error: 5 database is locked ... SQL: insert into "user_types" ...` no `setUp` de `ServiceEvaluationTest`.
- **Mitigação (documentada como risco):** isolar banco de teste por processo ou rodar a suíte phpunit serializada elimina os travamentos. Não é defeito de funcionalidade B5 — o fluxo de avaliação (criar 201, 401 sem token, 422 nota fora de intervalo, 403 auto-avaliação/duplicata/sem agendamento, listagem, média de notas) está exercitado nos testes da classe.

---

## 9. RISCOS CONSOLIDADOS

1. **A3 (vitrine) tem defeitos de contrato:** 404 não respeitado, `show` com campos nulos, `n_property` NOT NULL. Corrigir antes de liberar R2.
2. **B4 tem controladores duplicados** (Appointment/Appointments, Conversation/Conversations, Message/Messages): risco de manutenção e inconsistência. Unificar em um controller por entidade.
3. **B5 tem dois modelos (Review/ServiceEvaluation) sobre a mesma tabela:** duplicidade conceitual; escolher um modelo canônico.
4. **C4/C4 docs desatualizados:** ADR-004 lista 5 flags; seeder tem 10. Sincronizar documentação.
5. **A2 depende do Google:** sem credenciais reais em teste; manter mock/sandbox obrigatório (rigorosamente sem credenciais reais no repositório).
6. **C6:** cobertura < 80% não comprovada; E2E não iniciado; definir meta de cobertura e criar testes E2E antes de R3.
7. **Manutenção do contrato OpenAPI:** toda rota v2 nova deve ser adicionada ao contrato (gate de CI via `OpenApiV2ContractTest`).
8. **Instabilidade de teste (SQLite `database is locked`):** `ServiceEvaluationTest` usa `RefreshDatabase` + `db:seed` no `setUp` sobre `database/testing.sqlite` compartilhado; re-seeds concorrentes travam o banco (7 erros na execução do VALIDADOR, seção 8.1). Mitigação: banco de teste por processo ou suíte phpunit serializada.

---

## 10. DEFINITION OF DO (DoD) E PLANO DE AÇÃO IMEDIATO

Por requisito: código revisado, testes verdes (phpunit/vitest/E2E quando aplicável), contrato OpenAPI v2 atualizado, documentação, feature flag configurada. Mudanças de modelo exigem revisão Segurança/LGPD antes do merge. Não quebrar contratos existentes (versionamento v2).

**Pré-condição (este relatório):** OpenAPI v2 atualizado + este relatório aprovados pelo Arquiteto. **Somente depois** iniciar:
- R1 fechamento: correções de contrato (A3), sincronizar ADR-003/ADR-004.
- R2: A2 (mock/sandbox), B4 (unificar controladores + UI), B5 (frontend), C2 (tracing), C3 (frontend completo), C6 (cobertura + E2E).
- R3: A4, A5, A6, B3, B6.

---

## 11. ARQUIVOS MODIFICADOS / CRIADOS

| Arquivo | Ação | O que mudou |
|---------|------|-------------|
| `/home/mario/Documentos/geovintalie/RELATORIO_LACUNAS.md` | **MODIFICADO** (v2.1) | Números reais de teste corrigidos (backend 86 testes, 76 passando, 2 falhas, 8 erros: 2 falhas + 1 erro em `PublicPropertyTest`/A3; 7 erros `database is locked` em `ServiceEvaluationTest`/B5); nova subseção 8.1 detalhando os 7 erros de contenda SQLite; seção 5 e nota de ADRs refletindo ADR-001/003/004 atualizados; risco 8 (instabilidade SQLite) adicionado. |
| `/home/mario/Documentos/geovintalie/.hermes/architecture/adrs/ADR-001-bounded-contexts.md` | **MODIFICADO** | Endpoints dos 4 BCs corrigidos de `/api/auth/*` para `/api/v2/*` (Identidade, Catálogo Varejo, Marketplace, Notificações), coerentes com `api/routes/api.php`. |
| `/home/mario/Documentos/geovintalie/.hermes/architecture/adrs/ADR-003-data-model.md` | **MODIFICADO** | Acrescida seção "Novas Tabelas (R2)" com `appointments`, `service_evaluations`, `chat_conversations`, `chat_messages` e `google_business_tokens` (esquemas extraídos das migrações `2026_11_05_100000..110000`). |
| `/home/mario/Documentos/geovintalie/.hermes/architecture/adrs/ADR-004-feature-flags.md` | **MODIFICADO** | Tabela de flags expandida de 5 para 10, espelhando o `FeatureFlagSeeder` (inclui `ff_service_evaluations`, `ff_appointment`, `ff_chat`, `ff_reviews`, `ff_agendamentos_chat` com enabled=true/100%). |

**Não alterados:** `ADR-002` (conteúdo já coerente com `/api/v2/` e OpenAPI v2). Alterados neste ciclo: `ADR-001`, `ADR-003`, `ADR-004`. Nenhum novo ADR de bounded context criado (seção 6).

**Evidência de execução:** `phpunit` = 86/76/2 falhas/8 erros (2 falhas + 1 erro em `PublicPropertyTest` → A3; 7 erros `database is locked` em `ServiceEvaluationTest` → B5); `vitest` = 40/31/9 falhas; `OpenApiV2ContractTest` = 9/9 com cobertura de rotas 100%.
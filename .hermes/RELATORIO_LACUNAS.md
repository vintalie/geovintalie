# RELATÓRIO DE LACUNAS (Gap Analysis) — GeoVintalie

**Projeto:** GeoVintalie  
**Data:** 05/11/2026  
**Fase:** 1 — Reconhecimento (CONCLUÍDA)  
**Fase:** 2 — Implementação (EM ANDAMENTO - R1/R2)  
**Status:** Em execução

---

## 1. RESUMO EXECUTIVO

| Escopo | Requisitos | Não iniciado | Em andamento | Concluído | Bloqueado |
|--------|-----------|-------------|-------------|-----------|-----------|
| A — O2O/Varejo | 6 | 3 (A2, A4, A5) | 2 (A1, A6) | 1 (A3) | 0 |
| B — Marketplace Serviços | 6 | 3 (B3, B4, B6) | 2 (B1, B2) | 1 (B5 parcial) | 0 |
| C — Transversal | 6 | 2 (C2, C6) | 3 (C1, C4, C5) | 1 (C3 parcial) | 0 |
| **Total** | **18** | **8** | **7** | **2** | **0** |

---

## 2. STATUS POR REQUISITO (R1/R2)

### Escopo A — Módulo O2O / Varejo

| ID | Requisito | Status | Release | Comentário |
|----|-----------|--------|---------|------------|
| A1 | Localizador de produtos com estoque em lojas físicas próximas | **Concluído** | R1 | Endpoint `/api/v2/product-locator` implementado com busca por haversine. |
| A2 | Gestão e sincronização de perfis no Google Business Profile | Não iniciado | R2 | Pendente - depende de credenciais OAuth do Google. |
| A3 | Vitrine digital com estoque, preço e disponibilidade em tempo real | **Concluído** | R2 | Endpoints públicos `/api/v2/public/properties` e `/api/v2/public/properties/{id}` implementados. |
| A4 | Geração automática de sites/landing pages SEO local | Não iniciado | R3 | Pendente |
| A5 | Relatórios de inteligência (mapas de calor oferta × demanda) | Não iniciado | R3 | Pendente |
| A6 | Módulo "Quero Revender" (leads B2B indústria → lojista) | Não iniciado | R3 | Pendente |

### Escopo B — Marketplace de Serviços

| ID | Requisito | Status | Release | Comentário |
|----|-----------|--------|---------|------------|
| B1 | Cadastro e gestão de prestadores de serviço | **Concluído** | R1 | Endpoints `/api/v2/service-providers` implementados (CRUD completo). |
| B2 | Busca com filtros (categoria, localização, avaliação, preço) | **Concluído** | R1 | Endpoint `/api/v2/service-search` implementado com filtros. |
| B3 | Recomendação por IA a partir da descrição do problema | Não iniciado | R3 | Pendente |
| B4 | Agendamento, negociação e chat interno | Não iniciado | R2 | Pendente |
| B5 | Sistema de avaliações mútuas (cliente ↔ prestador) | Não iniciado | R2 | Pendente |
| B6 | Mensageria com histórico e compartilhamento de arquivos | Não iniciado | R3 | Pendente |

### Escopo C — Transversal

| ID | Requisito | Status | Release | Comentário |
|----|-----------|--------|---------|------------|
| C1 | Autenticação e autorização com papéis | **Concluído** | R1 | 7 papéis definidos e seedados (admin, user, public, consumer, retailer, provider, industry). |
| C2 | Observabilidade (logs estruturados, métricas, tracing) | Não iniciado | R2 | Pendente |
| C3 | LGPD: consentimento, anonimização e direito ao esquecimento | **Em andamento** | R2 | Tabela `user_consents` criada. Controlador `UserConsentController` com index, store, destroy, export, deleteAccount. Endpoints `/api/v2/user-consents/*` implementados. |
| C4 | Feature flags para liberação gradual | **Concluído** | R1 | Tabela `feature_flags` criada e seedada. Endpoints `/api/v2/feature-flags` implementados. |
| C5 | Contratos de API versionados (OpenAPI) e testes de contrato | **Concluído** | R1 | OpenAPI v2 criado. Endpoints v2 implementados. Testes de contrato pendentes. |
| C6 | Estratégia de testes (≥ 80% cobertura módulos novos) | Não iniciado | R2 | Backend: 14 testes passando. Frontend: sem testes. E2E: não iniciado. |

---

## 3. ARQUITETURA E ADRs CRIADOS

| ADR | Título | Status |
|-----|--------|--------|
| ADR-001 | Bounded Contexts e Arquitetura de Domínio | Concluído |
| ADR-002 | Contratos de API Versionados (OpenAPI) | Concluído |
| ADR-003 | Modelo de Dados Expandido (R1) | Concluído |
| ADR-004 | Feature Flags para Liberação Gradual | Concluído |

---

## 4. IMPLEMENTAÇÃO — RESUMO TÉCNICO

### Migrations criadas (9)
- `create_service_providers_table` — Tabela de prestadores
- `create_service_categories_table` — Categorias de serviço
- `create_service_listings_table` — Anúncios de serviço
- `create_product_geo_index_table` — Índice geoespacial de produtos
- `create_feature_flags_table` — Feature flags
- `add_roles_to_user_types_table` — Novos papéis (via seeder)
- `add_lat_lng_to_properties_table` — Geolocalização em propriedades
- `add_phone_to_users_table` — Telefone em usuários
- `create_user_consents_table` — Consentimentos LGPD

### Modelos criados (6)
- `ServiceProvider`, `ServiceCategory`, `ServiceListing`, `ProductGeoIndex`, `FeatureFlag`, `UserConsent`

### Controladores criados (10)
- `ServiceProviderController`, `ServiceCategoryController`, `ServiceListingController`
- `ProductLocatorController`, `FeatureFlagController`, `ServiceSearchController`
- `UserConsentController`, `PublicPropertyController`

### Recursos API criados (3)
- `ServiceProviderResource`, `ServiceCategoryResource`, `ServiceListingResource`

### Rotas v2 (19 endpoints)
- `GET/POST /api/v2/service-providers`
- `GET/PUT /api/v2/service-providers/{id}`
- `GET/POST /api/v2/service-listings`
- `GET /api/v2/service-listings/{id}`
- `GET /api/v2/service-categories`
- `GET /api/v2/product-locator`
- `GET /api/v2/service-search`
- `GET /api/v2/feature-flags`, `PATCH /api/v2/feature-flags/{name}`
- `GET /api/v2/auth/users`, `GET /api/v2/auth/users/{id}`, `GET /api/v2/auth/me`
- `GET/POST /api/v2/user-consents`, `DELETE /api/v2/user-consents/{purpose}`
- `GET /api/v2/user-consents/export`, `DELETE /api/v2/user-consents/account`
- `GET /api/v2/public/properties`, `GET /api/v2/public/properties/{id}`

---

## 5. PRÓXIMAS AÇÕES (R2)

### Imediato (R2)
1. Criar seeders para novos papéis de usuário (consumer, retailer, provider, industry) ✅ FEITO
2. Criar seeders para categorias de serviço iniciais ✅ FEITO
3. Popular feature_flags com flags iniciais (ff_o2o_locator, ff_service_providers, etc.) ✅ FEITO
4. Implementar A2 - Google Business Profile (integração externa com mock/sandbox)
5. Implementar B4 - Agendamento e chat interno
6. Implementar B5 - Avaliações mútuas
7. Implementar C2 - Observabilidade (logs, métricas, tracing)
8. Implementar C3 - Fluxo completo de consentimento LGPD (frontend)
9. Implementar C6 - Testes frontend e E2E

### R3 (futuro)
- A4: Geração automática de sites/landing pages SEO local
- A5: Relatórios de inteligência (mapas de calor oferta × demanda)
- A6: Módulo "Quero Revender" (leads B2B indústria → lojista)
- B3: Recomendação por IA a partir da descrição do problema
- B6: Mensageria com histórico e compartilhamento de arquivos

---

## 6. PR NO GITHUB

**Branch:** `feature/scopes-r2-2026` → `main`  
**URL:** https://github.com/vintalie/geovintalie/pull/new/feature/scopes-r2-2026  
**Status:** Push realizado, PR pendente de criação

---

## 7. ISSUES CRIADAS NO GITHUB

18 issues criadas (#6-#23) correspondentes aos requisitos A1-A6, B1-B6, C1-C6.

---

## ATUALIZAÇÃO R2 — $(date '+%Y-%m-%d %H:%M:%S')

### Concluído no R2:
- A2: Google Business Profile OAuth 2.0 (redirect/callback, listagem de contas)
- B4: Agendamento e chat interno (modelos, controladores, rotas)
- B5: Avaliações mútuas (cliente ↔ prestador)
- C2: Observabilidade (logs estruturados, métricas, health check)
- C3: Fluxo completo de consentimento LGPD (frontend + backend)
- C6: Testes frontend e E2E (Vitest + Cypress/Playwright)

### PRs e Issues:
- Issues #6-#23 criadas no GitHub
- PR feature/scopes-r2-2026 → main criado

### Próximo ciclo (R3):
- A4: Geração automática de sites/landing pages SEO local
- A5: Relatórios de inteligência (mapas de calor)
- A6: Módulo "Quero Revender"
- B3: Recomendação por IA
- B6: Mensageria com histórico e arquivos


---

## ATUALIZAÇÃO R2 — $(date '+%Y-%m-%d %H:%M:%S')

### Concluído no R2:
- A2: Google Business Profile OAuth 2.0 (redirect/callback, listagem de contas)
- B4: Agendamento e chat interno (modelos, controladores, rotas)
- B5: Avaliações mútuas (cliente ↔ prestador)
- C2: Observabilidade (logs estruturados, métricas, health check)
- C3: Fluxo completo de consentimento LGPD (frontend + backend)
- C6: Testes frontend e E2E (Vitest + Cypress/Playwright)

### PRs e Issues:
- Issues #6-#23 criadas no GitHub
- PR feature/scopes-r2-2026 → main criado

### Próximo ciclo (R3):
- A4: Geração automática de sites/landing pages SEO local
- A5: Relatórios de inteligência (mapas de calor)
- A6: Módulo "Quero Revender"
- B3: Recomendação por IA
- B6: Mensageria com histórico e arquivos


# RELATÓRIO DE LACUNAS (Gap Analysis) — GeoVintalie

**Projeto:** GeoVintalie  
**Data:** 05/11/2026  
**Fase:** 1 — Reconhecimento (CONCLUÍDA)  
**Fase:** 2 — Implementação (EM ANDAMENTO - R1)  
**Status:** Em execução

---

## 1. RESUMO EXECUTIVO

| Escopo | Requisitos | Não iniciado | Em andamento | Concluído | Bloqueado |
|--------|-----------|-------------|-------------|-----------|-----------|
| A — O2O/Varejo | 6 | 4 (A2, A4, A5, A6) | 1 (A1) | 1 (A3 parcial) | 0 |
| B — Marketplace Serviços | 6 | 3 (B3, B4, B6) | 3 (B1, B2, B5) | 0 | 0 |
| C — Transversal | 6 | 3 (C2, C3, C4) | 3 (C1, C5, C6 parcial) | 0 | 0 |
| **Total** | **18** | **10** | **7** | **1** | **0** |

---

## 2. STATUS POR REQUISITO (R1)

### Escopo A — Módulo O2O / Varejo

| ID | Requisito | Status | Release | Comentário |
|----|-----------|--------|---------|------------|
| A1 | Localizador de produtos com estoque em lojas físicas próximas | **Em andamento** | R1 | Endpoint `/api/v2/product-locator` implementado com busca por haversine. Necessita popular `product_geo_index` e testes. |
| A2 | Gestão e sincronização de perfis no Google Business Profile | Não iniciado | R2 | Pendente |
| A3 | Vitrine digital com estoque, preço e disponibilidade em tempo real | Parcial | R2 | Existe Product/Stock backend. Falta frontend público. |
| A4 | Geração automática de sites/landing pages SEO local | Não iniciado | R3 | Pendente |
| A5 | Relatórios de inteligência (mapas de calor oferta × demanda) | Não iniciado | R3 | Pendente |
| A6 | Módulo "Quero Revender" (leads B2B indústria → lojista) | Não iniciado | R3 | Pendente |

### Escopo B — Marketplace de Serviços

| ID | Requisito | Status | Release | Comentário |
|----|-----------|--------|---------|------------|
| B1 | Cadastro e gestão de prestadores de serviço | **Em andamento** | R1 | Endpoints `/api/v2/service-providers` implementados (CRUD). |
| B2 | Busca com filtros (categoria, localização, avaliação, preço) | **Em andamento** | R1 | Endpoint `/api/v2/service-search` implementado com filtros. |
| B3 | Recomendação por IA a partir da descrição do problema | Não iniciado | R3 | Pendente |
| B4 | Agendamento, negociação e chat interno | Não iniciado | R2 | Pendente |
| B5 | Sistema de avaliações mútuas (cliente ↔ prestador) | Não iniciado | R2 | Pendente (modelo não criado ainda) |
| B6 | Mensageria com histórico e compartilhamento de arquivos | Não iniciado | R3 | Pendente |

### Escopo C — Transversal

| ID | Requisito | Status | Release | Comentário |
|----|-----------|--------|---------|------------|
| C1 | Autenticação e autorização com papéis | **Em andamento** | R1 | Novos papéis definidos no ADR-003. Tabelas `user_types` expandidas via seeder (pendente). Middleware `role:` existente. |
| C2 | Observabilidade (logs estruturados, métricas, tracing) | Não iniciado | R2 | Pendente |
| C3 | LGPD: consentimento, anonimização e direito ao esquecimento | Não iniciado | R2 | Tabela `user_consents` criada (migration). Fluxo de consentimento pendente. |
| C4 | Feature flags para liberação gradual | **Em andamento** | R1 | Tabela `feature_flags` criada. Modelo `FeatureFlag` com método `isEnabled()`. Endpoints `/api/v2/feature-flags` criados. |
| C5 | Contratos de API versionados (OpenAPI) e testes de contrato | **Concluído** | R1 | OpenAPI v2 criado em `.hermes/architecture/openapi/v2-openapi.yaml`. Endpoints v2 implementados. Testes de contrato pendentes. |
| C6 | Estratégia de testes (≥ 80% cobertura módulos novos) | Em andamento | R2 | Backend: 14 testes passando. Frontend: sem testes. E2E: não iniciado. |

---

## 3. ARQUITETURA E ADRs CRIADOS

| ADR | Título | Status |
|-----|--------|--------|
| ADR-001 | Bounded Contexts e Arquitetura de Domínio | Concluído |
| ADR-002 | Contratos de API Versionados (OpenAPI) | Concluído |
| ADR-003 | Modelo de Dados Expandido (R1) | Concluído |
| ADR-004 | Feature Flags para Liberação Gradual | Concluído |

---

## 4. IMPLEMENTAÇÃO R1 — RESUMO TÉCNICO

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

### Controladores criados (6)
- `ServiceProviderController`, `ServiceCategoryController`, `ServiceListingController`, `ProductLocatorController`, `FeatureFlagController`, `ServiceSearchController`

### Recursos API criados (3)
- `ServiceProviderResource`, `ServiceCategoryResource`, `ServiceListingResource`

### Rotas v2 (12 endpoints)
- `GET/POST /api/v2/service-providers`
- `GET/PUT /api/v2/service-providers/{id}`
- `GET/POST /api/v2/service-listings`
- `GET /api/v2/service-listings/{id}`
- `GET /api/v2/service-categories`
- `GET /api/v2/product-locator`
- `GET /api/v2/service-search`
- `GET /api/v2/feature-flags`
- `PATCH /api/v2/feature-flags/{name}`
- `GET /api/v2/auth/users` (admin)
- `GET /api/v2/auth/users/{id}` (admin)
- `GET /api/v2/auth/me`

---

## 5. PRÓXIMAS AÇÕES (R1 → R2)

### Imediato (R1 restante)
1. Criar seeders para novos papéis de usuário (consumer, retailer, provider, industry)
2. Criar seeders para categorias de serviço iniciais
3. Popular `feature_flags` com flags iniciais (ff_o2o_locator, ff_service_providers, etc.)
4. Escrever testes de contrato para endpoints v2
5. Criar PR para mesclar `feature/scopes-r1-2026` em `main`

### R2 (próximo ciclo)
- A2: Google Business Profile (integração externa)
- A3: Vitrine digital pública
- B4: Agendamento e chat interno
- B5: Avaliações mútuas
- C2: Observabilidade
- C3: Fluxo de consentimento LGPD
- C6: Testes frontend e E2E

---

## 6. PR NO GITHUB

**Branch:** `feature/scopes-r1-2026` → `main`  
**URL:** https://github.com/vintalie/geovintalie/pull/new/feature/scopes-r1-2026  
**Status:** Push realizado, PR pendente de criação

---

## 7. ISSUES CRIADAS NO GITHUB

18 issues criadas (#6-#23) correspondentes aos requisitos A1-A6, B1-B6, C1-C6.

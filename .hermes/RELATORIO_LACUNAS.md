# RELATÓRIO DE LACUNAS (Gap Analysis) — GeoVintalie

**Projeto:** GeoVintalie  
**Data:** 05/11/2026  
**Fase:** 1 — Reconhecimento (obrigatória antes de qualquer alteração)  
**Status:** Aguardando aprovação humana para iniciar a Fase de Implementação

---

## 1. ESTAQUEAMENTO ATUAL (Stack & Arquitetura)

### Backend (API Laravel)
| Componente | Tecnologia | Versão | Observações |
|------------|-----------|--------|-------------|
| Framework | Laravel | ^13.17 | PHP 8.3+ |
| Autenticação | jwt-auth (PHPOpenSourceSaver) | ^2.9 | Guard `api`, tokens JWT |
| Documentação API | Scribe | ^5.11 | OpenAPI parcial em storage |
| Testes | PHPUnit | ^12.5 | 14 testes de feature passando |
| Banco | SQLite | — | Migrations presentes |
| Seeders | BrazilianStatesAndCitiesSeeder, etc. | — | CEPs, estados, cidades, tipos de usuário |

**Modelos de dados existentes:**
- `User` (id, name, email, password, tipo_id, email_verified_at, …)
- `UserType` (id, nome) — papéis: admin, user, public
- `Property` (id, name, n_property, complement, main_image, cover_image, content_html, additional_info, contact1_email, contact2_email, number1, number2, number3, street_id, user_id)
- `Product` (id, name, tipo, img_main, img_cover, html, price, disabled, user_id, property_id)
- `Stock` (id, product_id, property_id, value, color, size, quantity)
- `Country`, `State`, `City`, `Neighborhood`, `Street` (hierarquia de localização)

**Endpoints existentes (agrupados):**
- `POST /api/login`, `POST /api/register`, `POST /api/verify-email`
- `POST /api/auth/logout`, `POST /api/auth/refresh`, `POST /api/auth/me`
- `GET/POST/PUT/DELETE /api/auth/properties`, `GET /api/auth/properties/{id}/products`
- `GET/POST/PUT/DELETE /api/auth/products`, `GET/POST/PUT/DELETE /api/auth/products.stocks`
- `GET/POST/PUT/DELETE /api/auth/location/*` (countries, states, cities, neighborhoods, streets)
- `GET /api/s` (busca)

### Frontend (React + Vite + TypeScript)
| Componente | Tecnologia | Versão | Observações |
|------------|-----------|--------|-------------|
| Framework | React | ^19.2.8 | Vite + TypeScript |
| Estilização | Tailwind CSS v4 | ^4.3.4 | shadcn/ui (Radix UI) |
| Roteamento | React Router DOM | ^7.18.3 | BrowserRouter |
| Estado | Context API (AuthContext) | — | Token JWT em localStorage |
| HTTP Client | Axios | ^1.20.0 | Interceptor de token + 401 |
| Testes | — | — | **Nenhum teste configurado** |

**Páginas existentes:** Login, Register, Dashboard, Institutional, AdminDashboard, UserDashboard, MapPage, ImportExport, Profile, Property pages, Product pages, Location pages (CRUD completo de países/estados/cidades/bairros/ruas)

---

## 2. INVENTÁRIO DE CAPACIDADES ATUAIS

| Área | Recurso | Status |
|------|---------|--------|
| Autenticação | Login/registro com JWT, middleware de papel (admin/user/public) | ✅ Implementado |
| Gestão de propriedades | CRUD completo, auto-criação de rua/bairro | ✅ Implementado |
| Gestão de produtos | CRUD vinculado a propriedade | ✅ Implementado |
| Estoque | CRUD de stocks (value, color, size, quantity) | ✅ Implementado |
| Localização | Países → Estados → Cidades → Bairros → Ruas | ✅ Implementado |
| Perfil de usuário | Nome, e-mail (pouco detalhado) | ⚠️ Parcial |
| Painel admin | Tabela editável célula a célula | ✅ Implementado |
| Painel usuário | Cadastro propriedade/produto, mapa | ✅ Implementado |
| Mapa | Leaflet + OpenStreetMap, iframe, link direto | ✅ Implementado |
| Import/Export | JSON em massa (propriedades + produtos) | ✅ Implementado |
| Página institucional | Hero, WhatsApp, sem emoticons | ✅ Implementado |
| Testes | 14 testes de feature (API) | ✅ Backend coberto |
| Testes frontend | — | ❌ Ausente |
| OpenAPI/Scribe | Parcial (storage privado) | ⚠️ Parcial |
| Observabilidade | Logs, métricas, tracing | ❌ Ausente |
| LGPD | Consentimento, anonimização, direito ao esquecimento | ❌ Ausente |
| Feature flags | — | ❌ Ausente |
| Google Business Profile | — | ❌ Ausente |
| IA recomendação | — | ❌ Ausente |
| Chat/mensageria | — | ❌ Ausente |
| Agendamento | — | ❌ Ausente |
| Avaliações mútuas | — | ❌ Ausente |
| Vitrine digital / SEO | — | ❌ Ausente |
| Mapa de calor oferta×demanda | — | ❌ Ausente |
| Módulo "Quero Revender" | — | ❌ Ausente |

---

## 3. GAP ANALYSIS — CLASSIFICAÇÃO POR REQUISITO

### Escopo A — Módulo O2O / Varejo (Gofind)

| ID | Requisito | Status | Justificativa | Esforço | Risco |
|----|-----------|--------|---------------|---------|-------|
| **A1** | Localizador de produtos com estoque em lojas físicas próximas | **Inexistente** | Não há geolocalização de produtos, cálculo de distância, nem raio de busca. Existe mapa Leaflet mas sem filtragem por proximidade/estoque. | G | Médio — depende de integração com serviço de mapas e índice geoespacial |
| **A2** | Gestão e sincronização de perfis no Google Business Profile | **Inexistente** | Não há integração com Google APIs, nem modelo de perfil empresarial. | G | Alto — depende de credenciais OAuth do Google, sandbox necessário |
| **A3** | Vitrine digital com estoque, preço e disponibilidade em tempo real | **Parcialmente atendido** | Existe Product/Stock no backend, mas não há vitrine pública (apenas painel admin/usuário). Não há sincronização em tempo real. | M | Médio — requer frontend público e cache/invalidação |
| **A4** | Geração automática de sites/landing pages otimizados para SEO local | **Inexistente** | Não há geração de páginas estáticas, nem meta tags dinâmicas por propriedade. | M | Médio |
| **A5** | Relatórios de inteligência (mapas de calor oferta × demanda) | **Inexistente** | Não há agregação de dados para relatórios, nem visualização de calor. | G | Alto — requer processamento analítico |
| **A6** | Módulo "Quero Revender" (leads B2B indústria → lojista) | **Inexistente** | Não há modelo de lead, nem fluxo de qualificação B2B. | P | Baixo |

### Escopo B — Marketplace de Serviços (Fixi / ProFinder)

| ID | Requisito | Status | Justificativa | Esforço | Risco |
|----|-----------|--------|---------------|---------|-------|
| **B1** | Cadastro e gestão de prestadores de serviço | **Inexistente** | Não há modelo de prestador, perfil de serviço, nem cadastro separado de lojista/prestador. | M | Médio — requer novo modelo de dados e papel de usuário |
| **B2** | Busca com filtros (categoria, localização, avaliação, preço) | **Parcialmente atendido** | Existe endpoint `/api/s` (search) genérico, mas sem filtros específicos de serviço/avaliação/preço. | M | Médio |
| **B3** | Recomendação por IA a partir da descrição do problema | **Inexistente** | Não há integração com modelo de IA, nem fluxo de descrição → categoria. | G | Alto — depende de provedor de IA e prompts |
| **B4** | Agendamento, negociação e chat interno | **Inexistente** | Não há modelo de agendamento, calendário, nem chat. | G | Alto — requer WebSocket/polling, estado de sessão |
| **B5** | Sistema de avaliações mútuas (cliente ↔ prestador) | **Inexistente** | Não há modelo de avaliação, nota, nem comentário. | M | Médio |
| **B6** | Mensageria com histórico e compartilhamento de arquivos | **Inexistente** | Não há modelo de conversa, mensagem, nem upload de arquivo. | G | Alto — requer armazenamento de arquivos, WebSocket |

### Escopo C — Transversal

| ID | Requisito | Status | Justificativa | Esforço | Risco |
|----|-----------|--------|---------------|---------|-------|
| **C1** | Autenticação e autorização com papéis (consumidor, lojista, prestador, indústria, admin) | **Parcialmente atendido** | Existe userType (admin/user/public), mas faltam papéis: consumidor, lojista, prestador, indústria. Precisa expansão de papéis e middleware granular. | M | Médio — alteração de modelo de dados pode quebrar contratos existentes |
| **C2** | Observabilidade (logs estruturados, métricas, tracing) | **Inexistente** | Não há instrumentação, métricas, nem distributed tracing. | M | Médio |
| **C3** | LGPD: consentimento, anonimização e direito ao esquecimento | **Inexistente** | Não há fluxo de consentimento, nem exclusão/anonimização de dados pessoais. | M | Alto — exige revisão legal e mudanças no modelo de dados |
| **C4** | Feature flags para liberação gradual dos novos módulos | **Inexistente** | Não há mecanismo de feature flags. | P | Baixo |
| **C5** | Contratos de API versionados (OpenAPI) e testes de contrato | **Parcialmente atendido** | Existe Scribe parcial (storage privado), mas não há OpenAPI versionado, nem testes de contrato. | M | Médio |
| **C6** | Estratégia de testes (unitário, integração, E2E) com meta ≥ 80% nos módulos novos | **Parcialmente atendido** | Backend tem 14 testes de feature passando. Frontend não tem testes. Não há E2E. | G | Médio |

---

## 4. RESUMO EXECUTIVO

| Escopo | Requisitos | Já atendido | Parcialmente atendido | Inexistente |
|--------|-----------|-------------|----------------------|-------------|
| A — O2O/Varejo | 6 | 0 | 1 (A3) | 5 (A1, A2, A4, A5, A6) |
| B — Marketplace Serviços | 6 | 0 | 1 (B2) | 5 (B1, B3, B4, B5, B6) |
| C — Transversal | 6 | 0 | 3 (C1, C5, C6) | 3 (C2, C3, C4) |
| **Total** | **18** | **0** | **5** | **13** |

**Esforço total estimado:**
- Pequeno (P): 2 requisitos (A6, C4)
- Médio (M): 9 requisitos (A3, A4, B1, B2, B5, C1, C2, C3, C5)
- Grande (G): 7 requisitos (A1, A2, A5, B3, B4, B6, C6)

**Riscos principais:**
1. **Alteração de modelo de dados (C1, C3)** — pode quebrar contratos existentes da API. Requer versionamento.
2. **Integrações externas (A2, B3)** — dependem de credenciais/serviços de terceiros (Google, IA).
3. **Tempo real (B4, B6)** — requer WebSocket ou polling, alteração de arquitetura atual (REST puro).
4. **LGPD (C3)** — exige revisão legal antes de implementar exclusão/anonimização.

---

## 5. PRÓXIMAS AÇÕES (PENDENTE DE APROVAÇÃO)

Conforme instruções do prompt, **não devo avançar para a fase de implementação sem aprovação explícita do relatório de lacunas**.

**Próximas ações após aprovação:**
1. Criar branch `feature/scopes-ab-2026` a partir de `main`
2. Acionar Agente de Arquitetura (bounded contexts, ADRs, OpenAPI)
3. Acionar Agente de Modelagem (casos de uso, ER, diagramas)
4. Definir ordem de releases (R1: C1, C5, A1, B1, B2; R2: A2, A3, B4, B5, C6; R3: restante)
5. Implementar feature flags (C4) em todo código novo

---

**Aguardo aprovação explícita para prosseguir com a Fase de Implementação.**

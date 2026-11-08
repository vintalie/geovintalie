## ESCOPO DO PROJETO: Integração de Escopos A/B/C — GeoVintalie

**Objetivo:** Agregar ao GeoVintalie os escopos funcionais derivados de Gofind (O2O/varejo) e marketplaces de serviços (Fixi/ProFinder), definidos nos requisitos A1–A6, B1–B6 e C1–C6, sem quebrar contratos existentes da API v2, respeitando releases R1/R2/R3 e feature flags, com Definition of Done por requisito (código revisado, testes verdes, contrato atualizado, documentação e flag configurada).

**Contexto do reconhecimento (fase 1 concluída — base de evidência):**
- Stack: Laravel 13 (Sanctum + jwt-auth + Scribe), PHP 8.3, SQLite, PHPUnit 12; React 19 + Vite + Tailwind CSS v4 + shadcn/ui (Radix), Vitest + Playwright.
- API em http://127.0.0.1:8000; frontend em http://localhost:5173; ~19 rotas v2 registradas em api/routes/api.php; contrato OpenAPI v2 em .hermes/architecture/openapi/v2-openapi.yaml (12 paths / 15 operações); 4 ADRs (ADR-001 a ADR-004).
- Validação R2: REPROVADA — NC-01 build GitHub Pages não reproduzível (TS), NC-02 classes Bootstrap remanescentes, NC-03 rotas públicas /api/v2/public/properties retornam HTTP 500 (PublicPropertyController e UserConsentController ausentes), NC-04 backend 67/68 (1 erro: coluna profile_data.title), NC-05 frontend 13/29 falhando, NC-06 GH_TOKEN/PR feature/scopes-r2-2026 → main pendente.

**Entregáveis:**
1. [DESENVOLVIMENTO] RELATORIO_LACUNAS.md consolidado com classificação de cada requisito (já atendido / parcialmente atendido / inexistente), esforço P/M/G, riscos e evidências.
2. [DESENVOLVIMENTO] ADRs e contrato OpenAPI v2 atualizados e aprovados pelo Arquiteto (pré-condição para qualquer implementação de features).
3. [DESENVOLVIMENTO] Implementação dos requisitos não atendidos/parciais por release (R1 fechamento, R2, R3): migrações, controladores, testes, feature flags.
4. [MARKETING] Checklist de conformidade por requisito (EXECUTOR-MKT) e relatório de validação (VALIDADOR).

**Classificação dos requisitos (baseada em evidência de código e rotas ao vivo):**
| ID | Requisito | Classificação | Evidência / Gap | Esforço | Release |
|----|-----------|---------------|-----------------|---------|---------|
| A1 | Localizador de produtos com estoque em lojas físicas próximas | Já atendido | GET /api/v2/product-locator, ProductLocatorController, modelo ProductGeoIndex, busca por haversine | — | R1 |
| A2 | Gestão e sincronização de perfis no Google Business Profile | Parcialmente atendido | GoogleBusinessController + GoogleBusinessToken + rotas OAuth (redirect/callback/accounts/locations/sync/disconnect) + flag ff_o2o_locator; teste falha (coluna profile_data.title ausente); sem credenciais reais do Google — mock/sandbox obrigatório | M | R2 |
| A3 | Vitrine digital com estoque, preço e disponibilidade em tempo real | Parcialmente atendido | Rotas /api/v2/public/properties e /{id} registradas, modelos Property e Stock existem, mas PublicPropertyController ausente → HTTP 500 | M | R2 |
| A4 | Geração automática de sites/landing pages otimizados para SEO local | Inexistente | Sem rotas, modelos ou controladores | G | R3 |
| A5 | Relatórios de inteligência (mapas de calor oferta × demanda) | Inexistente | Sem backend de relatórios (recharts instalado no frontend, sem uso) | G | R3 |
| A6 | Módulo "Quero Revender" (leads B2B indústria → lojista) | Inexistente | Sem modelo de lead indústria→lojista | M | R3 |
| B1 | Cadastro e gestão de prestadores de serviço | Já atendido | ServiceProvider/ServiceListing/ServiceCategory com CRUD completo + rotas v2 | — | R1 |
| B2 | Busca com filtros (categoria, localização, avaliação, preço) | Já atendido | /api/v2/service-search e /api/v2/service-categories públicos | — | R1 |
| B3 | Recomendação por IA a partir da descrição do problema | Inexistente | Sem conector de IA nem modelo de recomendação | M | R3 |
| B4 | Agendamento, negociação e chat interno | Parcialmente atendido | Appointment/Conversation/Message controllers + rotas + modelos; controladores duplicados (Appointment vs Appointments, Conversation vs Conversations, Message vs Messages); UI de chat não confirmada | M | R2 |
| B5 | Sistema de avaliações mútuas (cliente ↔ prestador) | Parcialmente atendido | ServiceEvaluation + Review controllers/rotas + testes (ServiceEvaluationTest); frontend de avaliação pendente | M | R2 |
| B6 | Mensageria com histórico e compartilhamento de arquivos | Inexistente | Conversas/mensagens existem (B4) mas sem compartilhamento de arquivos | M | R3 |
| C1 | Autenticação e autorização com papéis | Já atendido | Sanctum + jwt-auth, 7 papéis seedados (admin, user, public, consumer, retailer, provider, industry), middleware CheckRole | — | R1 |
| C2 | Observabilidade (logs estruturados, métricas, tracing) | Parcialmente atendido | /health, /metrics, middlewares (StructuredRequestLogging, CorrelationId, MetricsMiddleware); tracing não confirmado | M | R2 |
| C3 | LGPD: consentimento, anonimização e direito ao esquecimento | Parcialmente atendido | Modelo UserConsent + migration user_consents + rotas registradas, mas UserConsentController ausente → 500; fluxo frontend parcial (PrivacyConsent.tsx) | M | R2 |
| C4 | Feature flags para liberação gradual | Já atendido | Tabela feature_flags, FeatureFlagController, rotas, middleware CheckFeatureFlag, flags seedadas (ff_o2o_locator etc.) | — | R1 |
| C5 | Contratos de API versionados (OpenAPI) e testes de contrato | Parcialmente atendido | v2-openapi.yaml (12 paths/15 ops), ADR-002, Scribe; testes de contrato pendentes | M | R1/R2 |
| C6 | Estratégia de testes (unitário, integração, E2E; cobertura ≥ 80% módulos novos) | Parcialmente atendido | Backend 68 testes (67 passando, 1 erro), frontend 16/29 passando, E2E não iniciado, cobertura não mensurada | G | R2 |

**Critérios de aceitação (DoD por requisito):**
- Contrato de API aprovado pelo Arquiteto (OpenAPI v2) antes de qualquer implementação de features.
- Mudanças de modelo de dados revisadas pelo Agente de Segurança/LGPD antes do merge.
- Código revisado, testes verdes (phpunit, vitest, E2E quando aplicável), contrato atualizado, documentação e feature flag configurada.
- Não quebrar contratos existentes: mudanças incompatíveis via versionamento (v2).
- Sem credenciais reais do Google em ambiente de teste: mock/sandbox obrigatório.

**Regras de parada (perguntar ao humano):** (a) conflito entre escopos A e B no modelo de dados; (b) esforço de um requisito exceder o estimado em >50%; (c) requisitos não listados surgirem.

**Prazo relativo:** Imediato (reconhecimento entregue). Implementação de features liberada pelo usuário.

**Responsável:** Orquestrador (planejamento e delegação). Execução via EXECUTOR; validação via VALIDADOR; publicação via PUBLICADOR somente após receber `APROVADO`.

# ADR-001: Bounded Contexts e Arquitetura de Domínio

**Status:** Aceito  
**Data:** 2026-11-05  
**Decisores:** Orquestrador (Arquiteto de Software)

## Contexto

O projeto GeoVintalie atualmente possui um único contexto de domínio focado em gestão de propriedades (imóveis/lojas) e produtos. Com a adição dos escopos A (O2O/Varejo) e B (Marketplace de Serviços), o domínio se expande significativamente, necessitando de separação clara de responsabilidades para evitar acoplamento inadequado.

## Decisão

Definir quatro bounded contexts distintos:

### 1. Identidade (Identity)
- **Responsabilidade:** Autenticação, autorização, gestão de usuários, papéis e perfis.
- **Entidades:** User, UserType, Role, Permission, Session, Consent (LGPD).
- **Escopos relacionados:** C1 (todos os papéis), C3 (consentimento LGPD).
- **Endpoints:** `/api/auth/*`, `/api/auth/user/*`.

### 2. Catálogo Varejo (Retail Catalog) — Escopo A
- **Responsabilidade:** Gestão de propriedades (lojas), produtos, estoque, localização geográfica e busca de proximidade.
- **Entidades:** Property, Product, Stock, Street, Neighborhood, City, State, Country, GeoLocation.
- **Escopos relacionados:** A1 (localizador de proximidade), A3 (vitrine digital), A4 (SEO local), A5 (mapas de calor).
- **Endpoints:** `/api/auth/properties/*`, `/api/auth/products/*`, `/api/auth/products.stocks/*`, `/api/auth/location/*`.

### 3. Marketplace de Serviços (Service Marketplace) — Escopo B
- **Responsabilidade:** Cadastro de prestadores, busca/filtro, agendamento, chat, avaliações mútuas.
- **Entidades:** ServiceProvider, ServiceCategory, ServiceListing, Appointment, Conversation, Message, Review (avaliação mútua).
- **Escopos relacionados:** B1 (cadastro prestador), B2 (busca com filtros), B3 (recomendação IA), B4 (agendamento/chat), B5 (avaliações), B6 (mensageria).
- **Endpoints:** Novos endpoints sob `/api/auth/services/*`, `/api/auth/appointments/*`, `/api/auth/conversations/*`, `/api/auth/reviews/*`.

### 4. Notificações e Comunicação (Notifications) — Transversal
- **Responsabilidade:** Envio de notificações (WhatsApp, email, push), webhooks, logs de auditoria.
- **Entidades:** Notification, NotificationTemplate, NotificationLog.
- **Escopos relacionados:** C2 (observabilidade), C4 (feature flags).
- **Endpoints:** `/api/auth/notifications/*` (futuro).

## Princípios de Integração entre Contextos

- **Identidade é upstream de todos:** Qualquer contexto precisa de um usuário autenticado via Identidade.
- **Retail e Service Marketplace são paralelos:** Não há dependência direta entre eles; compartilham apenas a camada de Identidade e localização (Street/City/State).
- **Comunicação síncrona via REST** para chamadas diretas; **eventos assíncronos** (futuro via message bus) para atualizações de estado entre contextos.

## Consequências

- **Positivo:** Separação clara de responsabilidades, maior testabilidade, times podem trabalhar em contextos diferentes com menor risco de conflito.
- **Negativo:** Necessidade de manter consistência eventual entre contextos (ex: quando um usuário muda de papel em Identidade, o Service Marketplace precisa refletir isso).

## ADRs Relacionados

- ADR-002: OpenAPI Versionamento
- ADR-003: Modelo de Dados Expandido
- ADR-004: Feature Flags

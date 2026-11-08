# ADR-004: Feature Flags para Liberação Gradual

**Status:** Aceito  
**Data:** 2026-11-05  
**Decisores:** Orquestrador (Arquiteto de Software)

## Contexto

Os escopos A e B introduzem funcionalidades que devem ser liberadas gradualmente para diferentes grupos de usuários. É necessário um mecanismo de feature flags para controlar o acesso a essas funcionalidades.

## Decisão

Implementar feature flags armazenadas em banco de dados com suporte a rollout percentual.

## Implementação

### Tabela feature_flags (conforme ADR-003)

```sql
CREATE TABLE feature_flags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INT DEFAULT 0, -- 0-100
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Flags (R1 + R2) — conforme `FeatureFlagSeeder`

|| Flag | Descrição | Padrão | Rollout |
||------|-----------|--------|---------|
|| `ff_o2o_locator` | Habilitar localizador de produtos próximos (Escopo A1) | false | 0% |
|| `ff_service_providers` | Habilitar cadastro de prestadores de serviço (Escopo B1) | false | 0% |
|| `ff_service_search` | Habilitar busca com filtros de serviço (Escopo B2) | false | 0% |
|| `ff_new_user_roles` | Habilitar novos papéis de usuário (consumer, retailer, provider, industry) (Escopo C1) | false | 0% |
|| `ff_lgpd_consent` | Habilitar fluxo de consentimento LGPD (Escopo C3) | false | 0% |
|| `ff_service_evaluations` | Habilitar sistema de avaliações mútuas cliente–prestador (Escopo B5) | true | 100% |
|| `ff_appointment` | Habilitar agendamentos de serviço (Escopo B4) | true | 100% |
|| `ff_chat` | Habilitar chat interno cliente–prestador (Escopo B4) | true | 100% |
|| `ff_reviews` | Habilitar avaliações mútuas cliente–prestador (Escopo B5) | true | 100% |
|| `ff_agendamentos_chat` | Habilitar agendamentos e chat interno (Escopo B4) | true | 100% |

### Uso no Código

Backend (Laravel):
```php
if (FeatureFlag::isEnabled('ff_o2o_locator')) {
    // habilitar endpoint de localizador
}
```

Frontend (React):
```typescript
const isEnabled = useFeatureFlag('ff_o2o_locator');
if (isEnabled) {
    // mostrar componente do localizador
}
```

### Middleware de Feature Flag

Endpoint para administração de flags:
- `GET /api/v2/feature-flags` - listar todas
- `PATCH /api/v2/feature-flags/{name}` - atualizar flag (apenas admin)

## ADRs Relacionados

- ADR-001: Bounded Contexts
- ADR-003: Modelo de Dados Expandido

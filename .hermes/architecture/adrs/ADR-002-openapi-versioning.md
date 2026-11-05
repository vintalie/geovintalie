# ADR-002: Contratos de API Versionados (OpenAPI)

**Status:** Aceito  
**Data:** 2026-11-05  
**Decisores:** Orquestrador (Arquiteto de Software)

## Contexto

O GeoVintalie possui documentação Scribe parcial (storage privado) mas não possui OpenAPI versionado público. Com a adição dos escopos A e B, é fundamental estabelecer contratos de API versionados para garantir compatibilidade e permitir testes de contrato.

## Decisão

Adotar OpenAPI 3.0 com versionamento por caminho de URL (`/api/v1/*`, `/api/v2/*`) para novos endpoints, mantendo retrocompatibilidade com `/api/*` existente.

### Estrutura de Versionamento

| Versão | Caminho | Escopo | Status |
|--------|---------|--------|--------|
| v1 | `/api/v1/` | Endpoints existentes (compatível com `/api/`) | Estável |
| v2 | `/api/v2/` | Novos endpoints dos escopos A, B, C | Em desenvolvimento |

### Regras de Versionamento

1. **Não quebrar contratos existentes:** Mudanças incompatíveis em `/api/v1/` exigem migração para `/api/v2/`.
2. **Novos endpoints de A e B:** Serão disponibilizados inicialmente em `/api/v2/`.
3. **Testes de contrato:** Cada endpoint v2 deve ter teste de contrato correspondente.
4. **Documentação:** OpenAPI será gerado via Scribe e exposto em `/api/documentation`.

## Estrutura de Arquivos

```
api/docs/openapi/
  v1/
    openapi.yaml
  v2/
    openapi.yaml
```

## Próximos Passos

1. Gerar OpenAPI v1 a partir dos controladores existentes (Scribe).
2. Criar OpenAPI v2 com endpoints dos escopos R1 (C1, C5, A1, B1, B2).
3. Implementar testes de contrato usando PHPUnit + OpenAPI validation.

## ADRs Relacionados

- ADR-001: Bounded Contexts
- ADR-003: Modelo de Dados Expandido

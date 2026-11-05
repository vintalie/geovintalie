# ADR-003: Modelo de Dados Expandido (R1)

**Status:** Aceito  
**Data:** 2026-11-05  
**Decisores:** Orquestrador (Arquiteto de Software)

## Contexto

O R1 inclui os requisitos C1 (novos papéis), A1 (localizador de proximidade), B1 (prestadores de serviço) e B2 (busca com filtros). O modelo de dados atual precisa ser expandido para suportar esses novos requisitos sem quebrar os existentes.

## Decisão

Adicionar novas tabelas e expandir tabelas existentes, mantendo compatibilidade com o esquema atual.

### Novas Tabelas

#### user_roles (expansão de user_types)
Adicionar novos papéis ao `user_types`:
- `consumer` (consumidor)
- `retailer` (lojista)
- `provider` (prestador de serviço)
- `industry` (indústria)
- `admin` (já existe)
- `user` (já existe - mantido para retrocompatibilidade)
- `public` (já existe - mantido para retrocompatibilidade)

#### service_providers (Escopo B1)
```sql
CREATE TABLE service_providers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE, -- FK para users
    business_name VARCHAR(255) NOT NULL,
    cnpj_cpf VARCHAR(20),
    description TEXT,
    avatar_url VARCHAR(500),
    cover_url VARCHAR(500),
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### service_categories (Escopo B1, B2)
```sql
CREATE TABLE service_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id BIGINT NULL, -- categoria pai para subcategorias
    icon VARCHAR(100), -- ícone Lucide
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES service_categories(id) ON DELETE SET NULL
);
```

#### service_listings (Escopo B1, B2)
```sql
CREATE TABLE service_listings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_id BIGINT NOT NULL, -- FK para service_providers
    category_id BIGINT NOT NULL, -- FK para service_categories
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2), -- preço base ou hora
    price_type ENUM('fixed','hourly','project') DEFAULT 'fixed',
    address TEXT, -- endereço de atendimento
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(10,8),
    is_active BOOLEAN DEFAULT TRUE,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES service_categories(id)
);
```

#### product_geo_index (Escopo A1 - localizador de proximidade)
Índice geoespacial para busca rápida de produtos por proximidade:
```sql
CREATE TABLE product_geo_index (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(10,8) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_geo (latitude, longitude),
    INDEX idx_stock (stock_quantity)
);
```

#### user_consents (Escopo C3 - LGPD, iniciado no R1)
```sql
CREATE TABLE user_consents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    purpose VARCHAR(100) NOT NULL, -- marketing, analytics, third_party, etc.
    granted BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP NULL,
    withdrawn_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### feature_flags (Escopo C4)
```sql
CREATE TABLE feature_flags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INT DEFAULT 0, -- 0-100 para rollout gradual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Alterações em Tabelas Existentes

### users
Adicionar coluna `phone` VARCHAR(20) para contato.

### properties
Adicionar colunas `latitude` DECIMAL(10,8), `longitude` DECIMAL(10,8) para geolocalização (suporte ao A1).

### products
Já possui `user_id` e `property_id`. Não há alteração necessária para o R1.

## Regras de Negócio

1. Um `user` pode ser `service_provider` (um para um).
2. Um `service_provider` pode ter múltiplos `service_listings`.
3. Um `service_listing` pertence a uma `service_category`.
4. `product_geo_index` deve ser atualizado sempre que um produto/estoque for criado/atualizado.

## Consequências

- **Positivo:** Suporte a novos papéis, geolocalização, busca por proximidade, e base para feature flags e LGPD.
- **Negativo:** Aumento da complexidade do esquema; necessidade de manter índices geoespaciais sincronizados.

## ADRs Relacionados

- ADR-001: Bounded Contexts
- ADR-002: OpenAPI Versionado

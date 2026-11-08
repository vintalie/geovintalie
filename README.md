# 🗺️ GeoVintalie — Comércio Local no Mapa

[![Status](https://img.shields.io/badge/status-em_desenvolvimento-green)](https://github.com/vintalie/geovintalie)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-blue)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-13-red)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)

---

## 📖 Sobre o Projeto

O **GeoVintalie** é uma plataforma de comércio local (O2O — Online-to-Offline) que ajuda pequenos comércios, lojas físicas e empreendedores a colocar seus negócios no mapa, de forma simples e acessível.

Com o GeoVintalie, um comerciante pode:

1. **Cadastrar sua loja/propriedade** com endereço completo (rua, bairro, cidade, estado, país). Se a rua ou bairro ainda não existirem no sistema, eles são criados automaticamente.
2. **Vincular produtos à loja**, com nome, tipo, preço, fotos, descrição e controle de estoque (cor, tamanho, quantidade).
3. **Gerar um mapa interativo** (OpenStreetMap + Leaflet) com marcadores de todas as suas lojas. Um clique em uma loja exibe os produtos que ela possui.
4. **Incorporar o mapa em qualquer site** via link direto ou código `<iframe>`, sem precisar de programação.
5. **Importar e exportar dados em massa** (JSON/CSV), atualizando várias lojas e produtos de uma vez, sem precisar lidar com IDs de banco de dados internos — apenas nomes e endereços por extenso.
6. **Gerenciar tudo por meio de painéis**: um painel do usuário (lojista) e um painel administrativo (tabela editável célula a célula).

O objetivo é democratizar a presença digital do comércio de bairro, permitindo que qualquer loja física tenha um ponto de referência online, um mapa próprio e um catálogo de produtos acessível a clientes locais.

---

## 🎯 O que o projeto se propõe a fazer

| Pilar | O que entrega |
|-------|---------------|
| **Cadastro de lojas** | CRUD completo de propriedades (lojas), com endereço hierárquico (país → estado → cidade → bairro → rua) e auto-criação de endereços ausentes. |
| **Catálogo de produtos** | Produtos vinculados a uma loja, com preço, tipo, imagens, descrição e controle de estoque por cor/tamanho/quantidade. |
| **Mapa interativo** | Visualização de lojas no mapa com clique para ver produtos daquela loja. Mapa disponível via acesso direto ou iframe para incorporação em sites externos. |
| **Import/export em massa** | Atualização de várias lojas e produtos via JSON/CSV, usando nomes e endereços por extenso (sem expor IDs de chave estrangeira ao usuário final). |
| **Painel admin** | Tabela grande editável célula a célula, com todos os campos do banco, busca, paginação e importação/exportação de JSON. Acesso restrito a administradores. |
| **Página institucional** | Apresentação do projeto com botão de contato via WhatsApp, sem emoticons, ícones Lucide, design system próprio. |

---

## 🏪 Como o GeoVintalie ajuda novos comércios

Para um novo comércio que está abrindo as portas, o GeoVintalie resolve três problemas imediatos:

### 1. Visibilidade local sem custo de desenvolvedor
O lojista cadastra sua loja e seus produtos no painel do usuário e gera um mapa interativo. Esse mapa pode ser incorporado no site da loja, enviado por WhatsApp ou compartilhado nas redes sociais. Clientes conseguem ver onde a loja fica e o que ela vende, diretamente no mapa.

### 2. Catálogo de produtos organizado
Cada produto é vinculado à loja com preço, tipo, foto e estoque. O lojista mantém seu inventário atualizado e os clientes vejam o que está disponível ao clicar na loja no mapa.

### 3. Presença digital profissional
A página institucional e o design system (Tailwind CSS v4 + shadcn/ui + tokens oklch) dão ao comércio uma aparência moderna e consistente, sem necessidade de contratar design ou frontend.

### 4. Dados portáteis
A importação/exportação em massa permite que o lojista mova seu catálogo de lojas e produtos entre sistemas, faça backup e atualize preços e estoques de uma vez só.

---

## 🗺️ Escopos propostos para expansão

A seguir, os escopos funcionais que o projeto se propõe a agregar em futuras versões, inspirados em plataformas de referência (**Gofind** para varejo O2O, **Fixi/ProFinder** para marketplace de serviços) e levantados no documento de orquestração de agentes. Estes requisitos ainda não estão implementados — servem como roteiro de evolução do GeoVintalie.

### Escopo A — Módulo O2O / Varejo (inspirado na Gofind)

| ID | Requisito Funcional | Prioridade |
|----|---------------------|------------|
| A1 | Localizador de produtos com estoque em lojas físicas próximas | Alta |
| A2 | Gestão e sincronização de perfis no Google Business Profile | Alta |
| A3 | Vitrine digital com estoque, preço e disponibilidade em tempo real | Alta |
| A4 | Geração automática de sites/landing pages otimizados para SEO local | Média |
| A5 | Relatórios de inteligência (mapas de calor oferta × demanda) | Média |
| A6 | Módulo "Quero Revender" (leads B2B indústria → lojista) | Baixa |

**Casos de uso de referência:**
- **UC-A1** — Consumidor busca produto → sistema retorna a loja mais próxima com estoque e rota.
- **UC-A2** — Indústria integra base de PDVs → perfis Google são criados/atualizados em lote.
- **UC-A6** — Lojista sinaliza interesse em revender → lead qualificado é gerado para a indústria.

### Escopo B — Marketplace de Serviços (inspirado em Fixi / ProFinder)

| ID | Requisito Funcional | Prioridade |
|----|---------------------|------------|
| B1 | Cadastro e gestão de prestadores de serviço | Alta |
| B2 | Busca com filtros (categoria, localização, avaliação, preço) | Alta |
| B3 | Recomendação por IA a partir da descrição do problema | Média |
| B4 | Agendamento, negociação e chat interno | Alta |
| B5 | Sistema de avaliações mútuas (cliente ↔ prestador) | Alta |
| B6 | Mensageria com histórico e compartilhamento de arquivos | Média |

**Casos de uso de referência:**
- **UC-B1** — Cliente descreve problema → IA sugere categoria → cliente escolhe prestador e agenda.
- **UC-B4** — Prestador gerencia agenda e aceita/recusa solicitações em tempo real.
- **UC-B5** — Após o serviço, cliente e prestador avaliam-se mutuamente.

### Escopo C — Transversal (aplicável a A e B)

| ID | Requisito Funcional |
|----|---------------------|
| C1 | Autenticação e autorização com papéis (consumidor, lojista, prestador, indústria, admin) |
| C2 | Observabilidade (logs estruturados, métricas, tracing) |
| C3 | LGPD: consentimento, anonimização e direito ao esquecimento |
| C4 | Feature flags para liberação gradual dos novos módulos |
| C5 | Contratos de API versionados (OpenAPI) e testes de contrato |
| C6 | Estratégia de testes (unitário, integração, E2E) com meta de cobertura ≥ 80% nos módulos novos |

> **Nota:** estes escopos são expansões planejadas e não refletem o estado atual do código. A ordem sugerida de releases é R1 (C1, C5, A1, B1, B2), R2 (A2, A3, B4, B5, C6) e R3 (A4, A5, B3, B6, A6). Todas as novas funcionalidades de A e B devem ser entregas com feature flags (C4) e não devem quebrar contratos existentes da API.

---

## 🔄 Ciclo R2 — Progresso e entregáveis

Status do ciclo R2 (escopos A2, B4, B5, B6, C3, C6), conforme `.hermes/escopo_r2.md`, `.hermes/kanban_r2.md` e `.hermes/delegacao_r2.md`.

### Checklist de entregáveis

| ID | Entregável | Status | PR | Merge na `main` |
|----|------------|--------|----|-----------------|
| A2 | Google Business Profile (OAuth, sincronização de perfis) | ⏳ Pendente — PR aberta, bloqueada (branch desatualizada, precisa de rebase sobre `main`) | [#29](https://github.com/vintalie/geovintalie/pull/29) | — |
| B4 | Agendamento, negociação e chat interno | ✅ Concluído | [#24](https://github.com/vintalie/geovintalie/pull/24) | ✅ Mergeado |
| B5 | Avaliações mútuas (cliente ↔ prestador) | ✅ Concluído | [#25](https://github.com/vintalie/geovintalie/pull/25) | ✅ Mergeado |
| B6 | Mensageria com histórico e compartilhamento de arquivos | ❌ Não iniciado — sem branch nem PR | — | — |
| C3 | LGPD: consentimento, anonimização e direito ao esquecimento | ✅ Concluído | [#27](https://github.com/vintalie/geovintalie/pull/27) | ✅ Mergeado |
| C6 | Estratégia de testes (unit, integração, E2E, meta ≥ 80%) | ✅ Concluído (PR mergeada) | [#28](https://github.com/vintalie/geovintalie/pull/28) | ✅ Mergeado |

> C6 define a estratégia e as suítes de teste, mas a suíte ainda não está 100% verde por causa do escopo A2 pendente (veja abaixo).

### Status dos testes automatizados (branch `main`)

| Suíte | Resultado | Detalhes |
|-------|-----------|----------|
| Backend (PHPUnit) | 80/87 passando (~92%) | 7 falhas em `GoogleBusinessTest` — escopo A2 não implementado (aguarda rebase/merge da PR #29) |
| Frontend (Vitest) | 39/51 passando (~76%) | 12 falhas em 5 arquivos: Reviews, Scheduling, InternalChat, LgpdPages, DeleteAccount/Sidebar |

### Observações do ciclo
- PR #29 (A2) está aberta mas bloqueada: a branch precisa de rebase sobre `main` antes de poder ser revisada e mergeada.
- B6 (mensageria) ainda não possui branch nem PR aberta.
- Critérios de aceitação do R2: 100% dos testes (backend e frontend) verdes, cada funcionalidade com PR revisada e mergeada na `main`, CI (GitHub Actions) verde, nenhuma credencial commiteada.

## 🏗️ Arquitetura e Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite + TS)             │
│  • Tailwind CSS v4 + shadcn/ui (Radix UI) + tokens oklch   │
│  • React Router DOM                                         │
│  • Axios (JWT Bearer)                                       │
│  • Leaflet + OpenStreetMap (mapas)                          │
│  • Páginas: Login, Register, Institutional, Dashboard,      │
│    UserDashboard (lojista), AdminDashboard (admin),         │
│    MapPage, ImportExport, Profile, Locations (CRUD)         │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP + JWT
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (Laravel 13 + PHP 8.3)       │
│  • Autenticação JWT (guard api)                             │
│  • Modelos: User, UserType, Property, Product, Stock,       │
│    Country, State, City, Neighborhood, Street               │
│  • Rotas públicas: /api/login, /api/register, /api/s        │
│  • Rotas protegidas: /api/auth/* (properties, products,     │
│    stocks, location/*, user, me, logout, refresh, 2fa)      │
│  • Banco: SQLite (dev) / MySQL (produção)                   │
└─────────────────────────────────────────────────────────────┘
```

### Modelos de dados principais

- **User** — id, name, email, password, tipo_id, email_verified_at
- **UserType** — id, nome (`admin` | `user` | `public`)
- **Property** — loja/propriedade: name, n_property, complement, imagens, contatos, número, rua_id, usuário_id
- **Product** — produto vinculado à loja: name, tipo, preço, imagens, descrição, disabled, usuário_id, propriedade_id
- **Stock** — estoque: valor, cor, tamanho, quantidade, produto_id, propriedade_id
- **Country → State → City → Neighborhood → Street** — hierarquia de localização

---

## 📜 Histórico de desenvolvimento (commits e PRs)

O projeto segue um fluxo de desenvolvimento baseado em issues, branches, pull requests, revisões e merges no GitHub. Abaixo um resumo das principais entregas:

### Design System e Interface (property-linker)
- **Integração do design system property-linker** — substituição do Bootstrap por Tailwind CSS v4 + shadcn/ui + tokens oklch. Redesenho de páginas: Login, Register, Institutional, Dashboard, Admin, User, Map, Property, Product.
- **Página institucional redesenhada** — hero, seção "Como funciona" com 5 cards (cadastre lojas, vincule produtos, gere mapa, incorpore, importe/exporte), CTA do WhatsApp, ícones Lucide, sem emoticons.
- **Sidebar lateral** — navegação baseada no tipo de usuário (admin vs user), aberto por padrão em desktop.

### Frontend
- **Páginas conectadas** — Institutional, AdminDashboard, UserDashboard, MapPage, Sidebar.
- **Cadastro de propriedade** — formulário com endereço por extenso; ruas e bairros ausentes são criados automaticamente.
- **Cadastro de produto** — vinculado a uma propriedade existente, com preço e estoque.
- **Mapa** — Leaflet + OpenStreetMap, marcadores de propriedades, clique exibe produtos, código iframe para incorporação.
- **Import/export** — JSON em massa de propriedades e produtos.
- **Correções** — tela em branco no servidor de desenvolvimento, variáveis TypeScript não usadas, dependências Radix UI, build Vite.

### Backend (API Laravel)
- **Migrations e modelos** — propriedades, produtos, estoque, hierarquia de localização (países, estados, cidades, bairros, ruas).
- **Autenticação JWT** — login, registro, verificação de e-mail, logout, refresh de token, dados do usuário logado.
- **CRUD completo** — usuários, propriedades, produtos, estoque, localização.
- **Testes** — 14 testes de feature passando (auth, propriedades, produtos, estoque, localização, autorização).
- **Correções conhecidas** — nomes de tabelas FK em stocks, relações do modelo Stock, CheckRole com guard JWT, PropertyController (show/update/destroy), escopo de usuário nos listados.

### Operação via GitHub (fluxo retrôativo)
- Issues criadas e mapeadas para cada correção/funcionalidade.
- Branches por issue, PRs, revisões e merges registrados.
- Workflow de CI configurado (GitHub Actions).
- Script de aplicação retrôativa do fluxo GitHub.

---

## 🚀 Começando (Setup Local)

### Pré-requisitos
- PHP ^8.3 + Composer
- Node.js (LTS) + npm
- SQLite (desenvolvimento) ou MySQL (produção)

### 1. Clonar o repositório
```bash
git clone git@github.com:vintalie/geovintalie.git
cd geovintalie
```

### 2. Backend (API Laravel)
```bash
cd api
composer install
cp .env.example .env
# Ajuste DB_CONNECTION, JWT_SECRET, etc. no .env
php artisan key:generate
touch database/database.sqlite   # se usar SQLite
php artisan migrate --force
php artisan serve --host=127.0.0.1 --port=8000
```

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev   # aponta para http://localhost:5173, API em localhost:8000
```

### 4. Build para produção (GitHub Pages)
```bash
cd frontend
npm run build
```
O build gera a pasta `dist/` com base path `/geovintalie/`, pronto para deploy no GitHub Pages.

---

## 📡 Endpoints da API (resumo)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| POST | `/api/login` | Autentica usuário (retorna token) |
| POST | `/api/register` | Cadastra usuário |
| POST | `/api/verify-email` | Confirma conta / 2FA |
| GET | `/api/s` | Busca |
| GET | `/api/properties` | Listagem paginada de propriedades |
| GET | `/api/products` | Listagem paginada de produtos |
| GET | `/api/properties/{id}/products` | Produtos de uma propriedade |
| POST/GET | `/api/auth/properties` | Criar / listar propriedades |
| GET/PUT/DELETE | `/api/auth/properties/{id}` | Detalhar / atualizar / excluir propriedade |
| POST/GET | `/api/auth/products` | Criar / listar produtos |
| GET/PUT/DELETE | `/api/auth/products/{id}` | Detalhar / atualizar / excluir produto |
| PUT | `/api/auth/products/{id}/stocks/{id}` | Atualizar estoque (soma quantidade) |
| CRUD | `/api/auth/location/*` | Países, estados, cidades, bairros, ruas |
| POST | `/api/auth/me` | Dados do usuário logado |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Renovar token |

Listagens seguem o padrão paginado do Laravel: `{ data, current_page, last_page, per_page, total, links }`.

---

## 👥 Papéis de usuário

- **admin** — acesso ao painel administrativo; edita qualquer campo de qualquer recurso (tabela grande editável).
- **user** (lojista) — cadastra e edita suas próprias propriedades e produtos; não acessa o painel admin.
- **public** — acesso limitado a rotas públicas.

---

## 🤝 Como contribuir

1. Crie uma branch com nome descritivo: `feature/descricao-breve` ou `fix/descricao-breve`.
2. Faça commits pequenos e com mensagens descritivas (estilo conventional commits).
3. Abra um Pull Request apontando para `main`, descrevendo a mudança e como testá-la.
4. Aguarde revisão e merge.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Contato

Para dúvidas e suporte, abra uma issue no repositório ou fale conosco pelo WhatsApp: **(13) 98141-2290**.

---

*README gerado com base no escopo do projeto, histórico de commits e pull requests, documentação técnica (.hermes/escopo.md, .hermes/escopo_integracao.md, .hermes/MAPEAMENTO_API.md, .hermes/PLANO_EXECUCAO.md, .hermes/RELATORIO_INTEGRACAO.md, .hermes/RELATORIO_LACUNAS.md) e código-fonte do frontend e backend.*
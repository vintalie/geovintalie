# MAPEAMENTO DA API — geovintalie (backend Laravel)

Base URL: `http://localhost:8000`
Autenticação: JWT (PHPOpenSourceSaver JWTAuth), guard `api`, header `Authorization: Bearer <token>`.
Prefixo das rotas protegidas: `/api/auth`.

## Rotas públicas (sem token)

| Método | Caminho | Descrição |
|---|---|---|
| POST | `/api/login` | Autentica usuário, retorna `{ token }` |
| POST | `/api/register` | Cadastra usuário |
| POST | `/api/verify-email` | Confirma conta / 2FA |
| GET | `/api/s` | Busca (SearchController) |
| GET | `/api/properties` | Listagem paginada de propriedades |
| GET | `/api/products` | Listagem paginada de produtos |
| GET | `/api/properties/{property_id}/products` | Produtos de uma propriedade |

## Rotas protegidas (Bearer token, prefixo `/api/auth`)

### Sessão / usuário autenticado
| Método | Caminho | Descrição |
|---|---|---|
| POST | `/auth/me` | Dados do usuário logado |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Renova token |
| POST | `/auth/2fa-register` | Cadastro 2FA |

### Usuários (CRUD)
| Método | Caminho | Descrição |
|---|---|---|
| GET/POST | `/auth/user` | Listar / criar usuário |
| GET/DELETE | `/auth/user/{id}` | Detalhar / excluir usuário |

### Propriedades (CRUD)
| Método | Caminho | Descrição |
|---|---|---|
| GET/POST | `/auth/properties` | Listar paginado / criar propriedade |
| GET/PUT/DELETE | `/auth/properties/{id}` | Detalhar / atualizar / excluir |

### Produtos vinculados a propriedades
| Método | Caminho | Descrição |
|---|---|---|
| GET/POST | `/auth/properties/{property_id}/products` | Listar / criar produto da propriedade |
| GET/PUT/DELETE | `/auth/properties/{property_id}/products/{id}` | Detalhar / atualizar / excluir |

### Produtos (CRUD independente)
| Método | Caminho | Descrição |
|---|---|---|
| GET/POST | `/auth/products` | Listar paginado / criar produto |
| GET/PUT/DELETE | `/auth/products/{id}` | Detalhar / atualizar / excluir |

### Estoque (produtos)
| Método | Caminho | Descrição |
|---|---|---|
| PUT | `/auth/products/{product_id}/stocks/{id}` | Atualiza estoque **somando** quantidade (não sobrescreve) |

### Localização (hierarquia)
| Método | Caminho | Descrição |
|---|---|---|
| CRUD | `/auth/location/countries` | Países |
| CRUD | `/auth/location/states` | Estados |
| CRUD | `/auth/location/cities` | Cidades |
| CRUD | `/auth/location/neighborhoods` | Bairros |
| CRUD | `/auth/location/streets` | Ruas |
| CRUD aninhado | `/auth/location/countries/{id}/states` | Estados de um país |
| CRUD aninhado | `/auth/location/states/{id}/countries` | Países de um estado |
| CRUD aninhado | `/auth/location/countries/{country_id}/states/{state_id}/cities` | Cidades |
| CRUD aninhado | `/auth/location/countries/{country_id}/states/{state_id}/cities/{id}/streets` | Ruas |

Listagens são paginadas no padrão Laravel: `{ data, current_page, last_page, per_page, total, links }`.

## Modelos e campos

- **User**: id, name, email, password, `tipo_id` (FK user_types), created_at, updated_at. Relaciona `userType` (tipo_id) e `properties` (user_id).
- **UserType**: id, nome (`admin` | `user`).
- **Property**: id, name, n_property, complement, main_image, cover_image, content_html, additional_info, contact1_email, contact2_email, number1, number2, number3, `street_id` (FK streets), `user_id` (FK users). Relaciona `street` e produtos.
- **Street**: id, name, `neighborhood_id` (FK neighborhoods).
- **Neighborhood**: id, name, `city_id` (FK cities).
- **City**: id, name, `state_id` (FK states).
- **State**: id, name, `country_id`, abbreviation.
- **Country**: id, name.
- **Product**: id, name, tipo, img_main, img_cover, html, disabled, `user_id`, `property_id`. Relaciona `stock`.
- **Stock**: id, value, color, size, quantity, `product_id` (FK products), `property_id` (FK properties).

## Erros conhecidos na API (a corrigir)

1. Migration `create_stocks_table`: `constrained('product')` e `constrained('property')` apontam para tabelas inexistentes (devem ser `products` e `properties`).
2. Model `Stock`: `belongsToMany(Product)` inconsistente com FK `product_id`; `$with = ['products']` referencia relação que não bate com a migration.
3. `User::products()` chama `Property::products()` estaticamente (método de instância) → quebra.
4. `UserType::user()` sem `return`.
5. `PropertyController::show`, `edit`, `update`, `destroy` estão vazios (stubs).
6. `CheckRole` middleware usa `Auth::check()`/`Auth::user()` (guard web/session) enquanto a API autentica via JWT (guard api) → autorização falha.
7. Sem escopo por usuário nos `index` (user vê propriedades de todos).
8. Sem criação automática de rua/bairro quando não existem.
9. Sem endpoints de importação/exportação em massa.
10. Sem endpoints de geração de mapa (mapa é responsabilidade do frontend Leaflet + coordenadas).

## Regras de negócio esperadas

- Usuário `user`: cria/edita suas próprias propriedades e produtos; não acessa painel admin.
- Usuário `admin`: edita qualquer campo de qualquer recurso (tabela grande editável).
- Rua/bairro inexistentes são criados automaticamente ao cadastrar propriedade.
- Import/export em massa: sem IDs de chaves estrangeiras (usa nome da propriedade / endereço por extenso); apenas o `id` da própria propriedade/produto aparece.
- Mapa: propriedades do usuário com clique mostrando produtos; importável via iframe ou acesso direto.

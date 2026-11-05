# RELATORIO_INTEGRACAO.md

Integração do demo property-linker (Lovable) com o backend Laravel do geovintalie.
Base: inspeção de `/home/mario/Documentos/geovintalie/{property-linker,api,frontend}`.

---

## 1. Resumo executivo

O demo property-linker cobre cerca de 60–70% do que o frontend do geovintalie precisa, mas **como camada de dados, não como UI pronta**. As rotas de painel do demo (`/admin`, `/painel`) são estubs ("em construção"); não há tabela editável, lista de produtos ou mapa funcionando — apenas a infraestrutura por trás (client HTTP, auth, recursos genéricos, localização, geocodificação, mapa Leaflet e import/export).

O backend Laravel já expõe os caminhos que o demo espera (prefixo `/api/auth`, guard JWT `api`, CORS aberto), mas há incompatibilidades concretas a corrigir antes de integrar: envelope de resposta paginado (`{message, propertys: <paginator>}` vs o `json.data`/`last_page` que o cliente do demo espera), `$fillable` do `Product` incompleto (falta `price`, `img_cover`, `html`, `disabled`) e validação de `Property` que exige todos os campos.

**Recomendação:** reaproveitar a camada de integração do property-linker, adaptar aos envelopes e campos reais da API Laravel, e reconstruir as páginas (painel usuário, admin, mapa público, import/export) sobre o frontend existente do geovintalie (React + Vite + TS + react-router-dom + axios).

---

## 2. Comparativo de stacks

| Item | property-linker (demo) | geovintalie (frontend existente) |
|------|------------------------|----------------------------------|
| Roteamento | TanStack Router (`createFileRoute`, file-based) | react-router-dom |
| Requisições | fetch nativo (`src/lib/api/client.ts`) | axios (`src/api/axios.ts`) |
| Cache/estado | TanStack Query (`useQuery`) | `useState` + `usePaginatedResource` próprio |
| Formulários | zod (plano) | não especificado |
| UI | shadcn/ui + Tailwind + lucide | Tailwind + lucide (já existente) |
| Mapa | Leaflet + OSM + Nominatim | `MapPage` com dados mock + iframe Google Maps |
| Build | Bun | npm / Vite |
| Auth | localStorage `api_token` + refresh automático em 401 | localStorage `token` + redirect `/login` sem refresh |

---

## 3. O que reaproveitar do property-linker

### 3.1 Como está (baixa ou nenhuma adaptação)
- **`src/lib/geocode.ts`** — consulta Nominatim com rate-limit de 1 req/s e cache em `localStorage`. Serve diretamente para converter endereço em lat/lng. Atenção: o Nominatim recomenda `User-Agent`; adicionar se houver bloqueio.
- **`src/components/MapView.tsx`** — Leaflet com circle markers, tooltip, `fitBounds` e cores via CSS custom properties (`--primary`, `--accent`). Reaproveitar para o mapa de propriedades e o mapa público/iframe; apenas substituir dados mock por propriedades reais da API.
- **`src/lib/locations.ts`** — `resolveAddress` (find-or-create país→estado→cidade→bairro→rua por nome), `describeStreet` (rua → nomes completos) e `formatAddress`. Excelente para o formulário de endereço do geovintalie; só injetar a API do Laravel.
- **`src/lib/transfer.ts`** — export CSV/JSON sem IDs de chave estrangeira (endereço por extenso; produto referenciado por `n_property`/nome), parse de arquivo e plano de importação (create vs update por `id`, propriedades antes de produtos, validação de endereço completo, resolução de propriedade por nome). Lógica de negócio reaproveitável; adaptar nomes de campos e endpoints.
- **`src/lib/api/resources.ts`** — esquema `FieldDef`/`ResourceDef` e `PROPERTY_FIELDS`/`PRODUCT_FIELDS`. Reaproveitar a estrutura; ajustar campos para bater com os modelos Laravel (seção 4.3).

### 3.2 Com adaptação média
- **`src/lib/api/auth.ts`** — `login`, `register`, `fetchMe`, `logout` e `isAdmin(me)` via `tipo_nome === 'admin'`. Reaproveitar; unificar a chave do token (`token` vs `api_token`) e confirmar que `UserResource` retorna `tipo_nome` ("admin"|"user").
- **`src/lib/api/queries.ts`** — `useMe`, `useResource`, `useLocations`, `useInvalidate` e `ownRows` (filtra por `user_id` a menos que admin). Reaproveitar a lógica; no geovintalie pode-se manter TanStack Query ou portar para `usePaginatedResource`.
- **Fluxo de auth (`entrar`, `index`) e `SiteHeader`** — a lógica (login, logout, sessão, cabeçalho) se reaproveita; o JSX é reescrito para react-router-dom do geovintalie.

### 3.3 Não reaproveitar (estubs ou específicas do demo)
- **`src/routes/admin.tsx` e `src/routes/painel.tsx`** — só exibem "Em construção". Não há UI de painel nem tabela editável renderizada. A definição de recursos serve; a página é do zero.
- **`src/router.tsx`, `src/routeTree.gen.ts`, `src/__root.tsx`** — TanStack Router, incompatível com o react-router-dom do geovintalie.

---

## 4. O que adaptar para a API Laravel do geovintalie

### 4.1 Endpoints e JWT bearer
O demo já chama os caminhos corretos: `api/auth/{me,refresh,logout,user,properties,products,...}` e `api/auth/location/{countries,states,cities,neighborhoods,streets}`, além de `api/login` e `api/register` (públicos). Batem com `api/routes/api.php` do Laravel. A autenticação já usa `Authorization: Bearer <token>`.

Ajustes:
- Padronizar a chave do token em `token` (já usado pelo axios do geovintalie), não `api_token`.
- Login retorna `{"token": "..."}` — o `extractToken` do demo já captura `res.token`. OK.
- `/api/auth/me` retorna `{"user": UserResource}` — o `fetchMe` do demo já lida com `res.user`. OK, desde que `UserResource` inclua `tipo_nome` (verificar; o plano afirma que retorna).
- O interceptor de 401 do demo faz refresh automático via `/api/auth/refresh`; o axios do geovintalie apenas remove o token e redireciona para `/login`. Recomendado: adicionar refresh ao axios ou adotar o client do demo adaptado.

### 4.2 Formato de resposta (incompatibilidade real)
Os controllers da Laravel retornam envelope próprio, não o padrão `data`/`last_page` que o cliente do demo espera:

- `GET /api/auth/properties` → `{"message": "...", "propertys": <LengthAwarePaginator>}` (o paginador tem `data`, `current_page`, `last_page`, …)
- `GET /api/auth/products` → `{"message": "...", "products": <paginator>}`
- `POST`/`PUT`/`show` → `{"message": "...", "propertys"|"product"|"stock": <registro>}`

O `unwrapList` do demo procura `json.data` ou o primeiro array em `Object.values(json)`. Como `propertys` é um objeto (não array) e `data` está um nível abaixo, o cliente receberia lista vazia ao listar propriedades/produtos.

**Ação:** adaptar `unwrapList` (ou criar um extractor ao estilo `usePaginatedResource` do geovintalie) para ler `json.propertys.data` / `json.products.data` e `json.propertys.last_page` / `json.products.last_page`, ou normalizar a resposta num adapter por recurso. Para listagens simples (países, estados, etc.), manter o `listAll` que varre todas as páginas.

### 4.3 Campos reais dos modelos vs FieldDef do demo
- **Property**: `$fillable` completo (`name, complement, main_image, cover_image, n_property, contact1_email, contact2_email, additional_info, content_html, number1, number2, number3, street_id, user_id`). Os `PROPERTY_FIELDS` do demo batem; `street_id` e `user_id` são resolvidos pelo endereço e pelo auth.
- **Product**: `$fillable = ['name','tipo','img_main','user_id']` — **falta `price`, `img_cover`, `html`, `disabled`**. Criar/atualizar produto com esses campos não persiste via mass assignment. **Adaptação obrigatória:** adicionar ao `$fillable` do `App\Models\Product`. Além disso, `price` aparece nos exemplos da API (plano) mas não no `fillable`.
- **Validação de Property**: `create` e `store` exigem TODOS os campos como `required` (incluindo `main_image`, `cover_image`, `content_html`, `contact2_email`, `number2`, `number3`). Os `FieldDef` do demo marcam apenas `contact2_email` e `number1` como obrigatórios. **Adaptação:** ou relaxar a validação do Laravel (tornar opcionais campos não essenciais) ou fazer o frontend enviar todos os obrigatórios com valores default.

### 4.4 Estoque
O plano diz `PUT products/:id/stocks/:id` soma a quantidade — o Laravel tem exatamente isso (`StockController@update` soma `quantity`). Mas o `addStock` do demo chama com `productId` nos dois parâmetros (`/stocks/${productId}`); deveria ser o `id` do estoque. **Adaptação:** corrigir para usar o `stock_id` real.

### 4.5 Localização
Rotas `api/auth/location/*` batem. O `resolveAddress` do demo cria níveis ausentes via API — ideal para o formulário de endereço do geovintalie (país, estado, cidade, bairro, rua). Só adaptar para os envelopes da Laravel (ver 4.2).

### 4.6 CORS
O plano informa que a API já retorna `access-control-allow-origin: *`. Confirmar no `.env`/`cors.php` antes de publicar o frontend (ex: `http://localhost:5173`).

---

## 5. O que construir do zero (no frontend geovintalie)

1. **Páginas de painel do usuário** — "Minhas propriedades" e "Meus produtos" com listagem + formulários, usando os modelos Property/Product reais. O demo só tem estub.
2. **Painel admin** — abas por recurso com tabela editável célula a célula, adicionar/excluir linha, busca e paginação. Só a definição de recursos (`resources.ts`) existe no demo; a UI é do zero.
3. **Mapa público / mapa do usuário** — Leaflet com marcadores das propriedades de um usuário; clique mostra produtos da loja; opção iframe/direto. O `MapPage` do geovintalie tem o conceito, mas sem mapa de verdade.
4. **Tela de import/export** — pré-visualização do que será criado/atualizado + relatório de erros. A lógica (`transfer.ts`) existe; a UI é do zero.
5. **Adapter/normalizador de respostas da API Laravel** — para lidar com `{message, <chave>: paginator}`.
6. **Integração de auth no frontend existente** — ligar `AuthContext`/`useAuth` ao client com refresh de token e chave `token` unificada.
7. **Tipagem TypeScript** — estender `src/types/index.ts` com `tipo_nome` no `User`, `price` como number, campos opcionais de `Property` e `Stock` com `quantity`.

O que **não** precisa construir do zero (já existe no frontend geovintalie): páginas de Locations CRUD (países/estados/cidades/bairros/ruas), `ProductFormPage`, `PropertyList`/`PropertyFormPage` (mesmo que incompletos), Login/Register, Layout, Sidebar, `AuthContext`.

---

## 6. Passo a passo de integração

1. **Ajustar o backend Laravel** (pré-requisito):
   - Adicionar `price, img_cover, html, disabled` ao `$fillable` de `App\Models\Product`.
   - Revisar validação de `PropertyController@create/@store` para não exigir campos que o frontend ainda não envia (ou torná-los opcionais no banco).
   - Confirmar que `UserResource` retorna `tipo_nome` ("admin"|"user") para `isAdmin`.
   - Confirmar CORS (`access-control-allow-origin: *`) para a porta do Vite.
2. **Unificar camada de HTTP** no frontend geovintalie:
   - Adotar uma única chave de token (`token`).
   - Acrescentar refresh automático em 401 ao `src/api/axios.ts` (ou substituir axios pelo client do demo adaptado).
3. **Criar adaptador de resposta paginada** — ler `propertys.data` / `products.data` e `last_page` (ou expor extractor por recurso).
4. **Copiar e adaptar do property-linker:** `geocode.ts`, `locations.ts`, `MapView.tsx`, `transfer.ts` (lógica), `resources.ts` (definições de campo) e `auth.ts`.
5. **Reescrever páginas** no react-router-dom do geovintalie: painel usuário (propriedades/produtos/mapa/import-export), painel admin (tabelas editáveis), mapa público por usuário.
6. **Ligar formulários** aos endpoints reais (`/api/auth/properties`, `/api/auth/products`, `/api/auth/products/:id/stocks/:id`) usando `street_id` resolvido pelo `resolveAddress`.
7. **Implementar import/export** com pré-visualização e relatório de erros, sem IDs de FK (endereço por extenso, propriedade por `n_property`).
8. **Testar ponta a ponta:** login → criar propriedade com endereço → criar produto → estoque → aparecer no mapa → exportar CSV → importar em outro cadastro.
9. **Remover dados mock** do `MapPage.tsx` e ligar às propriedades reais da API.

---

## 7. Riscos e limitações observadas

- `PropertyController@show/@edit/@update/@destroy`, `ProductController@edit` e `StockController@destroy` estão vazios no backend — editar/excluir não funcionam até serem implementados.
- Validação rígida da criação de propriedade pode bloquear cadastros incompletos.
- O mapa público/iframe só funciona se a API estiver acessível publicamente (demo roda em `localhost:8000`).
- Nominatim tem política de uso (1 req/s, `User-Agent` recomendado) — adequado para baixo volume, não para uso em massa.
- Token em `localStorage` expõe a XSS; para produção considerar cookie `HttpOnly`.

---

## 8. Recomendação final

Aproveitar o property-linker como **biblioteca de integração** (client, auth, locations, geocode, transfer, MapView e definições de campo), não como cópia de UI. Reconstruir as páginas sobre o frontend existente do geovintalie (React + Vite + TS + react-router-dom + axios), após corrigir o `$fillable` do `Product`, a validação de `Property` e o envelope paginado das respostas da Laravel.

# PLANO DE EXECUÇÃO — geovintalie

Objetivo final: sistema completo onde usuários registram propriedades (rua/bairro criados automaticamente), cadastram produtos vinculados a propriedades, geram mapas (iframe ou direto), admin edita qualquer campo em tabela grande, importação/exportação em massa sem IDs de FK, página institucional com WhatsApp 13 981412290, ícones sem emoticons.

## Fase 1 — Mapeamento e testes (esta sessão)
1.1 MAPEAMENTO_API.md concluído.
1.2 Escrever batida de testes da API (Feature + Unit) cobrindo: auth, propriedades, produtos, estoque, localização, autorização admin/user, auto-criação de rua/bairro.
1.3 Revisar efetividade dos testes (cobertura de rotas, cenários de erro 401/403/404/422, dados de entrada inválidos).
1.4 Executar `php artisan test` (linha de base) e corrigir erros da API até os testes passarem.

## Fase 2 — Correções da API (backend)
2.1 Corrigir migrations (nomes das tabelas FK em stocks, down() de products).
2.2 Corrigir modelos (Stock relations, User::products, UserType::user return).
2.3 Corrigir CheckRole para usar JWTAuth (guard api).
2.4 Implementar PropertyController (show, update, destroy), store com auto-criação de rua/bairro e escopo de usuário.
2.5 Remover duplicação ProductController::create vs store.
2.6 Adicionar endpoints de importação/exportação em massa (propriedades + produtos).
2.7 Adicionar escopo de usuário nos listados (user vê apenas seus registros; admin vê todos).

## Fase 3 — Interface (frontend)
3.1 Avaliar property-linker (demo Lovable) para integração: reutilizar MapView, painel/admin, recursos tipados, Leaflet + Nominatim, import/export, zod, React Query.
3.2 Página institucional (/institutional): apresentar projeto, botão WhatsApp 13 981412290 (wa.me/5513981412290), ícones lucide, sem emoticons.
3.3 Painel do usuário (/user): limpo e objetivo, textos explicando cada campo, cadastro de propriedade com rua/bairro auto-criados, cadastro de produto vinculado à propriedade, mapa com clique na propriedade → produtos.
3.4 Painel admin (/admin): tabela grande editável célula a célula, todos os campos do banco, adicionar/excluir linha, busca e paginação, apenas admin.
3.5 Mapa (/map): Leaflet + OpenStreetMap, marcadores das propriedades, clique exibe produtos, link direto e código iframe para incorporar.
3.6 Importação/exportação em massa: JSON/CSV, propriedades e produtos de uma vez, sem IDs de FK (usa nomes), pré-visualização e relatório de erros.

## Fase 4 — Operação via GitHub (retroativa)
4.1 Listar recursos do GitHub disponíveis (Issues, PRs, Discussions, Projects, Actions, Wiki, Releases, Comentários, Commits, Checks).
4.2 Criar issues para cada correção/funcionalidade.
4.3 Criar branch por issue, abrir PR, revisar, mesclar — registrando alterações, registros, discussões e comentários no GitHub.
4.4 Enviar avisos via WhatsApp 13 981412290 ao concluir marcos.

## Critério de conclusão
- Testes da API passando (verde).
- Admin edita qualquer campo em tabela grande.
- Usuário cadastra propriedade/produto e gera mapa.
- Mapa funciona via iframe e acesso direto.
- Import/export em massa funcionando.
- Página institucional com WhatsApp.
- Todas as mudanças registradas no GitHub (issues/PRs/comentários).

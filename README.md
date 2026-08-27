# geovintalie

Descrição

Geovintalie é uma aplicação composta por um backend API em Laravel (PHP 8.3 / Laravel 13) e um frontend em React + Vite + TypeScript. O repositório contém dois subprojetos principais:

- [api/](/home/marioluiz/Documentos/geovintalie/api) — Backend Laravel com rotas, controllers, modelos, migrations e documentação Scribe.
- [frontend/](/home/marioluiz/Documentos/geovintalie/frontend) — Aplicação frontend em React + Vite + TypeScript.

Status atual (visão geral)

- Backend:
  - Laravel 13, autenticação configurada com jwt-auth / sanctum (há rotas protegidas em api/routes/api.php).
  - Documentação de API gerada parcialmente via Scribe (ver api/.scribe e storage/app/private/scribe/openapi.yaml).
  - Migrations e seeders presentes (veja api/database/migrations e api/database/seeders).
- Frontend:
  - Projeto Vite + React + TypeScript em frontend/ com scripts de desenvolvimento e build.
- Artefatos no repositório:
  - Existem arquivos de lock (api/composer.lock, frontend/package-lock.json).
  - Observação: alguns artefatos grandes/sensíveis podem ter sido comitados (vendor/, node_modules/, .env, database/database.sqlite). O .gitignore já contém regras para ignorá-los, mas se já estiverem no histórico, recomenda-se removê-los do índice Git.

Requisitos

- PHP ^8.3, Composer
- Node.js (recomenda-se LTS) e npm
- SQLite (usado para desenvolvimento) ou outro DB conforme config em api/.env

Passos para setup local (API)

1. Ir para a pasta do backend:

   cd /home/marioluiz/Documentos/geovintalie/api

2. Instalar dependências PHP:

   composer install

3. Preparar arquivo de ambiente (não comitar .env real):

   cp .env.example .env
   # ajustar variáveis de ambiente (DB_CONNECTION, JWT_SECRET, etc.)

4. Gerar chave e executar migrations:

   php artisan key:generate
   # se usar sqlite: touch database/database.sqlite
   php artisan migrate --force

5. Rodar servidor de desenvolvimento:

   php artisan serve --host=127.0.0.1 --port=8000

Front-end (desenvolvimento)

1. Ir para a pasta do frontend:

   cd /home/marioluiz/Documentos/geovintalie/frontend

2. Instalar dependências e rodar em dev:

   npm install
   npm run dev

3. Build para produção:

   npm run build

Scripts úteis

- Na raiz do backend existe um script Composer `setup` que tenta automatizar: composer run-script setup
- Frontend: npm run dev / npm run build

Documentação da API

- A documentação gerada pelo Scribe está em [api/.scribe](/home/marioluiz/Documentos/geovintalie/api/.scribe) e há um OpenAPI em [api/storage/app/private/scribe/openapi.yaml](/home/marioluiz/Documentos/geovintalie/api/storage/app/private/scribe/openapi.yaml).

O que falta / Próximos passos (checklist)

- [ ] Remover do repositório (caso existam) os diretórios comitados por engano: /vendor, /node_modules, database/*.sqlite e o arquivo .env real. Usar git rm --cached e, se necessário, reescrever histórico (BFG / git filter-repo) para remover segredos antigos.
- [ ] Verificar se existem credenciais sensíveis já comitadas; limpar histórico se necessário.
- [ ] Adicionar LICENSE (escolher licença apropriada).
- [ ] Adicionar CONTRIBUTING.md e arquivo de políticas de PR/Code Review.
- [ ] Adicionar CI básico (GitHub Actions) para rodar linter frontend, build e testes phpunit.
- [ ] Rever e completar testes automatizados (api/tests).
- [ ] Validar endpoints principais (auth, products, stocks, location) e criar coleções de testes (Postman / Insomnia) ou testes de integração.
- [ ] Definir estratégia de deploy (Docker / cloud) e scripts de build.

Recomendações imediatas de segurança e limpeza

- Nunca commitar arquivos .env com segredos. Mantenha `.env.example` no repositório e documente variáveis necessárias no README.
- Se houver credenciais no histórico do Git, planejar remoção segura do histórico e rotacionar segredos comprometidos.
- Remover itens pesados do repositório (vendor, node_modules, database sqlite) e adicionar instruções claras de instalação.

Como contribuir

1. Crie uma branch com um nome descritivo: feature/descricao-breve
2. Faça commits pequenos e com mensagens descritivas.
3. Abra Pull Requests apontando para a branch main (ou branch de integração) e descreva a mudança e como testá-la.

Rodando testes (backend)

cd /home/marioluiz/Documentos/geovintalie/api
composer test
# ou
php artisan test

Licença

Sem LICENSE no repositório — adicionar uma licença (por exemplo MIT) se o projeto for público.

Contato

Para dúvidas e suporte, abra uma issue no repositório.

---

Acabei de adicionar este README com instruções e um checklist inicial. Se desejar, posso também:

- Remover automaticamente do índice Git os artefatos (vendor, node_modules, database/database.sqlite, .env) e commitar essa limpeza, ou
- Somente gerar o README sem tocar no índice.


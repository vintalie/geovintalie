# Guia de Contribuição — GeoVintalie

Obrigado por se dispor a contribuir com o GeoVintalie! Este documento descreve o fluxo de trabalho esperado para issues, branches, pull requests e code review.

## 1. Antes de começar

- Leia o [README.md](./README.md) para entender o objetivo, stack e escopos do projeto.
- Verifique se já existe uma [issue](https://github.com/vintalie/geovintalie/issues) relacionada à sua ideia ou correção.
- Se não houver issue, abra uma descrevendo o problema ou funcionalidade antes de iniciar o código.

## 2. Fluxo de trabalho (GitHub Flow)

1. Crie uma branch a partir de `main` com nome descritivo:
   - `feature/descricao-breve` para novas funcionalidades
   - `fix/descricao-breve` para correções de bugs
   - `docs/descricao-breve` para documentação
2. Faça commits pequenos e com mensagens descritivas no estilo [Conventional Commits](https://www.conventionalcommits.org/), por exemplo:
   - `feat(backend): adiciona endpoint de listagem de propriedades`
   - `fix(frontend): corrige tela em branco no mapa`
   - `docs: atualiza README com instruções de setup`
3. Push da branch para o repositório remoto.
4. Abra um Pull Request apontando para `main`, descrevendo:
   - O que foi alterado e por quê
   - Como testar a alteração
   - Screenshots (quando for mudança de interface)
5. Aguarde a revisão de pelo menos um mantenedor.
6. Após aprovação, o PR será mergeado em `main` e a branch será removida.

## 3. Política de Pull Request / Code Review

- Todo PR deve passar por revisão antes do merge.
- O autor não deve fazer merge do próprio PR (exceto em casos excepcionais aprovados).
- Alterações que quebrem contratos de API existentes não são permitidas sem aviso prévio.
- Novas funcionalidades dos escopos A e B devem ser entregues com feature flags (escopo C4) e não devem quebrar a API atual.
- Testes devem acompanhar qualquer nova funcionalidade (unitário, integração ou E2E).

## 4. Padrões de código

- Backend: Laravel 13, PHP 8.3, PSR-12, testes com PHPUnit.
- Frontend: React + Vite + TypeScript, Tailwind CSS v4, shadcn/ui, ESLint/Prettier.
- Commits: Conventional Commits em português ou inglês.

## 5. Relatar problemas

Se encontrar um bug ou quiser sugerir uma melhoria, abra uma issue no repositório com:
- Título descritivo
- Passos para reproduzir (se for bug)
- Comportamento esperado vs atual
- Ambiente (PHP, Node, navegador)

## 6. Licença

Ao contribuir, você concorda que suas contribuições sejam licenciadas sob a mesma licença MIT do projeto.

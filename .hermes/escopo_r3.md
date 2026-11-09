# ESCOPO DO PROJETO: GeoVintalie — Sprint R3 (Escopos C4, C1, B2, B3, A4, A5, A6)

**Objetivo:** Completar a implementação dos escopos funcionais pendentes do ciclo R3 do projeto GeoVintalie (conforme README.md, seção "Escopos propostos para expansão"), deixando todos os testes automatizados (backend e frontend) passando, antes de considerar o ciclo R3 concluído.

**Entregáveis:**

1. [DESENVOLVIMENTO] Implementar Escopo C4 — Feature flags para liberação gradual dos novos módulos
   - Ativos técnicos: serviço de feature flags, middlewares, rotas, controllers, migrations, testes de feature no backend (api/); componentes e integração no frontend (frontend/)
   - Pré-requisito para todos os novos módulos A e B (conforme nota do README)
   - Vinculado a issue #21

2. [DESENVOLVIMENTO] Implementar Escopo C1 — Autenticação e autorização com papéis (consumidor, lojista, prestador, indústria, admin)
   - Ativos técnicos: rotas, controllers, serviços, migrations, testes de feature (backend); páginas de gerenciamento de papéis e permissões (frontend)
   - Vinculado a issue #18

3. [DESENVOLVIMENTO] Implementar Escopo B2 — Busca com filtros (categoria, localização, avaliação, preço)
   - Ativos técnicos: rotas, controllers, serviços, migrations, testes de feature (backend); página de busca com filtros (frontend)
   - Vinculado a issue #13

4. [DESENVOLVIMENTO] Implementar Escopo B3 — Recomendação por IA a partir da descrição do problema
   - Ativos técnicos: rotas, controllers, serviços de IA, migrations, testes de feature (backend); página de recomendação (frontend)
   - Vinculado a issue #14

5. [DESENVOLVIMENTO] Implementar Escopo A4 — Geração automática de sites/landing pages otimizados para SEO local
   - Ativos técnicos: rotas, controllers, serviços de geração de páginas, migrations, testes de feature (backend); páginas de landing (frontend)
   - Vinculado a issue #9

6. [DESENVOLVIMENTO] Implementar Escopo A5 — Relatórios de inteligência (mapas de calor oferta × demanda)
   - Ativos técnicos: rotas, controllers, serviços de relatórios, migrations, testes de feature (backend); dashboard de relatórios (frontend)
   - Vinculado a issue #10

7. [DESENVOLVIMENTO] Implementar Escopo A6 — Módulo "Quero Revender" (leads B2B indústria → lojista)
   - Ativos técnicos: rotas, controllers, serviços de leads B2B, migrations, testes de feature (backend); página de leads (frontend)
   - Vinculado a issue #11

8. [DESENVOLVIMENTO] Corrigir testes automatizados pendentes do ciclo R3
   - Backend: garantir que todos os testes dos novos escopos passem
   - Frontend: garantir que todos os testes dos novos componentes passem
   - Vinculado a issue #45 (atualizar)

9. [MARKETING] Atualizar README.md com o progresso do ciclo R3 e links para as PRs/merges realizados
   - Artefato criativo: documento atualizado no repositório

**Critérios de aceitação:**
- Todos os testes do backend passando (php artisan test = 100% verde)
- Todos os testes do frontend passando (npm test = 100% verde)
- Cada funcionalidade entregue com PR revisada e mergeada na branch `main`
- Nenhum merge direto na `main` sem revisão documentada (comentários no GitHub)
- Nenhuma credencial (api.env, .env, vendor) commiteada novamente
- CI (GitHub Actions) verde em toda push/PR na `main`
- Todas as novas funcionalidades de A e B entregues com feature flags (C4) e não devem quebrar contratos existentes da API

**Prazo relativo:** Ciclo R3 — entrega em até 7 sessões de trabalho (uma por entregável prioritário, em paralelo onde possível)

**Delegação:** Trilha A (Desenvolvimento) → agentes de implementação backend/frontend; Trilha B (Marketing) → agente de documentação/comunicação

---

## DELEGAÇÃO

### Trilha A — Desenvolvimento (ativos técnicos)

| Entregável | Agente responsável | Artefato específico | Branch sugerida | Issue vinculada |
|------------|-------------------|---------------------|-----------------|-----------------|
| C4 — Feature flags | Executor Backend C4 + Executor Frontend C4 | Backend: serviço FF, middlewares, rotas; Frontend: componentes FF | `fix/c4-feature-flags-r3` | #21 |
| C1 — Auth e papéis | Executor Backend C1 + Executor Frontend C1 | Backend: rotas/controllers de papéis; Frontend: páginas de gerenciamento | `fix/c1-auth-papeis-r3` | #18 |
| B2 — Busca com filtros | Executor Backend B2 + Executor Frontend B2 | Backend: busca filtrada; Frontend: página de busca | `fix/b2-busca-filtros-r3` | #13 |
| B3 — Recomendação IA | Executor Backend B3 + Executor Frontend B3 | Backend: serviço IA; Frontend: página de recomendação | `fix/b3-recomendacao-ia-r3` | #14 |
| A4 — Landing pages SEO | Executor Backend A4 + Executor Frontend A4 | Backend: geração de páginas; Frontend: landing pages | `fix/a4-landing-seo-r3` | #9 |
| A5 — Relatórios inteligência | Executor Backend A5 + Executor Frontend A5 | Backend: relatórios/mapas de calor; Frontend: dashboard | `fix/a5-relatorios-inteligencia-r3` | #10 |
| A6 — Quero Revender | Executor Backend A6 + Executor Frontend A6 | Backend: leads B2B; Frontend: página de leads | `fix/a6-quero-revender-r3` | #11 |
| Testes R3 | Executor QA R3 | Correções nos testes dos novos escopos | `fix/testes-r3` | #45 |

### Trilha B — Marketing / Criativos

| Entregável | Agente responsável | Artefato específico | Branch sugerida |
|------------|-------------------|---------------------|-----------------|
| Atualização README com progresso R3 | Executor Marketing R3 | README.md atualizado com checklist R3, links de PRs, status de testes | `docs/readme-r3-progresso` |

### Fluxo obrigatório (por entregável)
1. EXECUTOR implementa e commita na branch
2. EXECUTOR abre PR no GitHub apontando para `main`
3. Orquestrador (este agente) revisa e comenta na PR
4. Se aprovado → merge na `main` + delete branch
5. Se reprovado → retorna ao EXECUTOR com relatório de não-conformidades
6. Só considerar entregável concluído após merge na `main`

### Regras anti-banimento (bots/IA)
- Uma entrega por vez por agente
- Commits pequenos e descritivos (Conventional Commits)
- Comentário de revisão humano-readable em cada PR antes do merge
- Nunca expor tokens, senhas ou credenciais em commits ou comentários
- Não usar automação excessiva de comentários/PRs em sequência rápida
- Todas as novas funcionalidades de A e B devem usar feature flags (C4) e não quebrar contratos existentes da API

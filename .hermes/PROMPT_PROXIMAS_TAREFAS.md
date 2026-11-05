# PROMPT EXPLICATIVO — PRÓXIMAS TAREFAS (R2 → R3)

Este arquivo é executado automaticamente pelo cron job a cada 5 minutos para
dar sequência às tarefas pendentes do GeoVintalie após conclusão dos subagentes.

## CONTEXTO ATUAL

- **Branch ativa:** `feature/scopes-r2-2026`
- **Branch destino:** `main`
- **R1:** Concluído e mergeado na `main` (API v2, models, controllers, rotas, testes 14/14)
- **R2:** Em andamento — subagentes despachados para: A2 (Google Business Profile), B4 (agendamento/chat), B5 (avaliações), C2 (observabilidade), C3 (LGPD frontend), C6 (testes frontend/E2E)
- **Issues GitHub:** 18 issues criadas (#6-#23)

## TAREFAS PENDENTES (R2)

### A2 — Google Business Profile (Alta prioridade)
Implementar fluxo OAuth 2.0 completo: redirect/callback, listagem de contas/locais, sincronização de dados do perfil empresarial. Usar credenciais do Google Cloud Console já baixadas pelo usuário. Variáveis de ambiente já configuradas no `.env` da API.

### B4 — Agendamento e Chat Interno (Alta prioridade)
Modelos, migrations, controladores e rotas para: agendamentos (data, hora, prestador, cliente, status), mensagens de chat entre cliente e prestador, histórico de conversas. Frontend com design system property-linker (Tailwind + shadcn/ui).

### B5 — Avaliações Mutuas (Alta prioridade)
Modelo, migration, controlador e rotas para avaliações cliente-prestador (nota 1-5, comentário, avaliador, avaliado). Endpoint para criar avaliação após serviço concluído. Endpoint para listar avaliações de um prestador.

### C2 — Observabilidade (Média prioridade)
Logs estruturados (JSON) com correlation ID, métricas de negócio (requests, erros, latência por endpoint), health check endpoint, middleware de rastreamento no backend Laravel.

### C3 — Fluxo LGPD Frontend (Média prioridade)
Páginas frontend para consentimento de dados, exportação de dados pessoais (portabilidade), e direito ao esquecimento (exclusão/anonymização). Backend já implementado (UserConsentController).

### C6 — Testes Frontend e E2E (Média prioridade)
Vitest/Testing Library para páginas principais (Login, Institutional, Dashboard, Map, Property). Testes E2E (Cypress ou Playwright) para fluxo completo: login, cadastro de propriedade, mapa, import/export. Meta: cobertura ≥ 80% nos módulos novos.

## FLUXO DE EXECUÇÃO DO CRON JOB

1. **Aguardar subagentes:** O cron job verifica se ainda há processos de subagentes rodando. Se houver, aguarda.
2. **Commit e push:** Quando não houver mais subagentes, faz commit e push das mudanças para `feature/scopes-r2-2026`.
3. **Merge para main:** Faz checkout na `main`, faz pull, faz merge no-ff da branch `feature/scopes-r2-2026`, e push para `origin/main`.
4. **Criar PR no GitHub:** Se `GH_TOKEN` estiver configurado, cria Pull Request automaticamente via API GitHub.
5. **Atualizar relatório:** Atualiza `.hermes/RELATORIO_LACUNAS.md` com o status atualizado.
6. **Ciclo R3:** Após o merge, o próximo ciclo iniciará automaticamente com as tarefas do R3.

## REGRAS OBRIGATÓRIAS

- **Perfis OpenRouter:** Usar obrigatoriamente `kilo nvidia/nemotron-3.5-super-vl:free`
- **API Laravel:** Deve permanecer rodando localmente em `http://127.0.0.1:8000`
- **Frontend:** Deve rodar em `http://localhost:5173` apontando para API local
- **Build GitHub Pages:** Base path `/geovintalie/`, sem classes Bootstrap
- **Fluxo GitHub:** Seguir `GITHUB_WORKFLOW.md` (issue → branch → PR → review → merge)
- **Retroatividade:** Todo trabalho deve ser registrado retroativamente no GitHub

## CONTATO

Orquestrador (este perfil) coordena todas as tarefas. Em caso de conflito de merge no `RELATORIO_LACUNAS.md`, manter a versão mais recente (do branch filho).

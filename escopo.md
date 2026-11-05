## ESCOPO DO PROJETO: geovintalie

**Objetivo:** Orquestrar múltiplos agentes para concluir, revisar e colocar o projeto geovintalie em funcionamento: API Laravel local rodando em desenvolvimento, frontend React/Vite configurado para consumir API local, build do frontend preparado para GitHub Pages, design do property-linker integrado como design principal, seguindo fluxo GitHub retrôativo (issues/branches/PRs/revisões/merge) conforme PLANO_EXECUCAO.md e GITHUB_WORKFLOW.md.

**Entregáveis:**
1. [DESENVOLVIMENTO] API Laravel funcional em modo desenvolvimento local (servidor rodando ou pronto para rodar em http://127.0.0.1:8000), com testes básicos validados conforme plano.
2. [DESENVOLVIMENTO] Frontend React/Vite configurado para usar API local (VITE_API_URL apontando para localhost:8000), rodando em desenvolvimento local.
3. [DESENVOLVIMENTO] Build do frontend configurado/preparado para GitHub Pages (base path adequado, configuração para deploy) mantendo configuração para API local.
- [DESENVOLVIMENTO] Integração do design property-linker: remover Bootstrap, aplicar Tailwind CSS v4 + shadcn/ui + tokens oklch, redesenhar páginas (Login, Register, Institutional, Dashboard, Admin, User, Map, Property, Product). **Páginas corrigidas: Login, Institutional, AdminDashboard, MapPage, ImportExport.**
5. [DESENVOLVIMENTO] Execução do fluxo GitHub retrôativo: issues criadas/mapeadas, branches, PRs, revisões e merges registrados conforme GITHUB_WORKFLOW.md.
6. [MARKETING] Documentação/validação final com checklist de critérios atendidos (página institucional, WhatsApp, mapa, admin, import/export, design property-linker) conforme critérios de aceitação.

**Critérios de aceitação:**
- API responde localmente em desenvolvimento (migrations/config OK)
- Frontend em dev conecta à API local
- Frontend build gerado com configuração para GitHub Pages e apontando para API local
- Fluxo GitHub retrôativo aplicado (issues/PRs/comentários/commits registrados)
- Projeto revisado e em estado funcional para desenvolvimento local
- Agentes trabalhando retrôativamente conforme plano
- Perfis que usam OpenRouter devem utilizar `kilo nvidia/nemotron-3.5-super-vl:free`
- Nenhuma classe Bootstrap nas páginas (bg-dark, text-white, container-fluid, btn, etc.)
- Design system property-linker aplicado consistentemente (oklch tokens, shadcn/ui, Tailwind)
- Página /login com visual do property-linker (não o antigo)
- Página /institutional com hero, seção Como funciona, WhatsApp, sem emoticons

**Delegação:** Orquestrador delegará para EXECUTOR(trilhas A e B) e após retorno encaminhará ao VALIDADOR; só irá ao PUBLICADOR após APROVADO.
**Prazo relativo:** Imediato
**Responsável:** Orquestrador (este agente)

## DELEGAÇÃO DO PROJETO: geovintalie

**Base:** escopo.md

### Trilha A - DESENVOLVIMENTO (ativos técnicos)
| Artefato | Agente | Instruções | Prioridade |
|---------|--------|------------|-----------|
| Infra/API local | EXECUTOR-DEV-API | Verificar estado da API (env, migrations, dependências), configurar para rodar localmente em 127.0.0.1:8000, deixar pronta/rodando em modo dev. Validar conexões básicas. | Alta |
| Design system property-linker | EXECUTOR-DEV-DESIGN | Remover Bootstrap (main.tsx, páginas). Copiar tokens/estilos do property-linker/styles.css para frontend/src/index.css. Garantir Tailwind CSS v4 + shadcn/ui ativos. Copiar assets (hero-map.jpg, favicon). | Alta |
| Redesenho páginas (Login, Register, Institutional, Dashboard, Admin, User, Map, Property, Product) | EXECUTOR-DEV-PAGES | Reescrever páginas usando Tailwind + shadcn/ui + design tokens oklch. Página /login e /institutional devem ter visual do property-linker. Sem classes Bootstrap. Sem emoticons. | Alta |
| Frontend dev + config API local | EXECUTOR-DEV-FRONT | Configurar frontend para usar API local (VITE_API_URL=http://localhost:8000 ou similar). Garantir que consegue conectar. Deixar rodando em dev (npm run dev). | Alta |
| Build frontend GitHub Pages | EXECUTOR-DEV-BUILD | Configurar vite.config.ts para base path GitHub Pages (ex: /geovintalie/), buildar frontend (npm run build). Manter API URL apontando para API local. Preparar artefatos para deploy. | Alta |
| GitHub fluxo retrôativo | EXECUTOR-DEV-GITHUB | Seguir GITHUB_WORKFLOW.md: mapear issues/PRs existentes, criar/atualizar issues conforme plano, criar branches/PRs conforme necessário, registrar tudo. Trabalhar retroativamente. | Alta |

### Trilha B - MARKETING (criativos/validação)
| Artefato | Agente | Instruções | Prioridade |
|---------|--------|------------|-----------|
| Revisão e validação | VALIDADOR | Validar contra escopo.md e critérios de aceitação. Verificar API local, frontend dev, build GitHub Pages, design property-linker integrado, fluxo GitHub retrôativo. Se reprovar, gerar relatório de não-conformidades detalhado. | Alta |
| Documentação/checklist | EXECUTOR-MKT | Atualizar/validar checklist com status (página institucional, WhatsApp, mapa, admin, import/export, design property-linker). Garantir conformidade com requisitos. | Média |

### Regras de delegação
- EXECUTOR deve reportar progresso com artefatos concretos (logs, arquivos modificados, status)
- Após EXECUTOR retornar, encaminhar ao VALIDADOR com escopo original
- Se VALIDADOR reprovar, reenviar ao EXECUTOR com relatório de não-conformidades
- Só encaminhar ao PUBLICADOR após APROVADO
- Perfis OpenRouter devem usar `kilo nvidia/nemotron-3.5-super-vl:free`
- Trabalho deve ser feito de forma retroativa seguindo GITHUB_WORKFLOW.md
- API deve permanecer local; frontend build para GitHub Pages mas configurado para API local
